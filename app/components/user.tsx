import { useState, useEffect, useMemo, useRef } from "react";

import styles from "./user.module.scss";

import ResetIcon from "../icons/reload.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import CopyIcon from "../icons/copy.svg";
import ClearIcon from "../icons/clear.svg";
import LoadingIcon from "../icons/three-dots.svg";
import EditIcon from "../icons/edit.svg";
import EyeIcon from "../icons/eye.svg";
import {
  Input,
  List,
  ListItem,
  Modal,
  PasswordInput,
  Popover,
  Select,
  showConfirm,
} from "./ui-lib";
import { ModelConfigList } from "./model-config";

import { IconButton } from "./button";
import {
  SubmitKey,
  useChatStore,
  Theme,
  useUpdateStore,
  useAccessStore,
  useAppConfig,
} from "../store";

import Locale, {
  AllLangs,
  ALL_LANG_OPTIONS,
  changeLang,
  getLang,
} from "../locales";
import { copyToClipboard } from "../utils";
import Link from "next/link";
import { Path, RELEASE_URL, UPDATE_URL } from "../constant";
import { Prompt, SearchService, usePromptStore } from "../store/prompt";
import { ErrorBoundary } from "./error";
import { InputRange } from "./input-range";
import { useNavigate, Navigate } from "react-router-dom";
import { Avatar, AvatarPicker } from "./emoji";
import { getClientConfig } from "../config/client";
import { useSyncStore } from "../store/sync";
import { nanoid } from "nanoid";

import "./user.css";
import { Button, message } from "antd";
import { Post } from "../api/request/http";

export function User() {
  const [messageApi, contextHolder] = message.useMessage();
  const cardIdRef: any = useRef(null);
  const cardPasswordRef: any = useRef(null);

  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;

  const updateStore = useUpdateStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const currentVersion = updateStore.formatVersion(updateStore.version);
  const remoteId = updateStore.formatVersion(updateStore.remoteVersion);
  const hasNewVersion = currentVersion !== remoteId;
  const updateUrl = getClientConfig()?.isApp ? RELEASE_URL : UPDATE_URL;

  function checkUpdate(force = false) {
    setCheckingUpdate(true);
    updateStore.getLatestVersion(force).then(() => {
      setCheckingUpdate(false);
    });

    console.log("[Update] local version ", updateStore.version);
    console.log("[Update] remote version ", updateStore.remoteVersion);
  }

  const usage = {
    used: updateStore.used,
    subscription: updateStore.subscription,
  };
  const [loadingUsage, setLoadingUsage] = useState(false);
  function checkUsage(force = false) {
    if (accessStore.hideBalanceQuery) {
      return;
    }

    setLoadingUsage(true);
    updateStore.updateUsage(force).finally(() => {
      setLoadingUsage(false);
    });
  }

  const accessStore = useAccessStore();
  const enabledAccessControl = useMemo(
    () => accessStore.enabledAccessControl(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const promptStore = usePromptStore();
  const builtinCount = SearchService.count.builtin;
  const customCount = promptStore.getUserPrompts().length ?? 0;
  const [shouldShowPromptModal, setShowPromptModal] = useState(false);

  const showUsage = accessStore.isAuthorized();
  useEffect(() => {
    // checks per minutes
    checkUpdate();
    showUsage && checkUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // esc键返回home
  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(Path.Home);
      }
    };
    document.addEventListener("keydown", keydownEvent);
    return () => {
      document.removeEventListener("keydown", keydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientConfig = useMemo(() => getClientConfig(), []);
  const showAccessCode = enabledAccessControl && !clientConfig?.isApp;

  const [cardId, setCardId] = useState("");
  const [cardPassword, setCardPassword] = useState("");
  const [exchangeLoading, setExchangeLoading] = useState(false);

  // gpt-key赋值
  const updateGpt = () => {
    const url = "https://api.openai-proxy.org";
    const key: any = localStorage.getItem("gpt-key");
    accessStore.updateOpenAiUrl(url);
    accessStore.updateToken(key.slice(0, -1));
  };
  // 兑换 卡券
  const exchangeCard = async () => {
    const token = localStorage.getItem("token");
    setExchangeLoading(true);
    const res = await Post(
      "/api/card/active",
      {
        card_id: cardId,
        secret: cardPassword,
      },
      {
        headers: {
          Authorization: token,
        },
      },
    );
    console.log(res.msg, res);
    if (res.status) {
      localStorage.setItem("gpt-key", res.data + "1");
      // 刷新token
      const refreshTokenRes = await Post(
        "/api/user/refresh",
        {
          key: res.data,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      console.log(refreshTokenRes);
      localStorage.setItem("token", refreshTokenRes.data.token);
      updateGpt();
      messageApi.open({
        type: "success",
        content: res.msg,
      });
      setCardId("");
      setCardPassword("");
      cardIdRef.current.value = "";
      cardPasswordRef.current.value = "";
      navigate(Path.Home);
    } else {
      messageApi.open({
        type: "error",
        content: res.msg,
      });
    }
    setExchangeLoading(false);
  };
  // 取消登录
  const cancleLogin = () => {
    console.log("取消登录");
  };

  return (
    <ErrorBoundary>
      {contextHolder}
      <div className="window-header" data-tauri-drag-region>
        <div className="window-header-title">
          <div className="window-header-main-title">{Locale.User.Title}</div>
          <div className="window-header-sub-title">{Locale.User.SubTitle}</div>
        </div>
        <div className="window-actions">
          <div className="window-action-button"></div>
          <div className="window-action-button"></div>
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
            />
          </div>
        </div>
      </div>
      <div className={styles["settings"]}>
        <List>
          <ListItem title={Locale.User.Card.Title} className="vertical-flex">
            <div className="user-flex">
              <span style={{ lineHeight: "36px" }}>
                {Locale.User.Card.IdName}
              </span>
              <input
                type="text"
                ref={cardIdRef}
                placeholder={Locale.User.Card.IdPlaceholder}
                onChange={(e) => {
                  setCardId(e.currentTarget.value);
                }}
                style={{ display: "inline-block", maxWidth: "70%" }}
              ></input>
            </div>
            <div className="user-flex">
              <span style={{ lineHeight: "36px" }}>
                {Locale.User.Card.PasswordName}
              </span>
              <input
                type="text"
                ref={cardPasswordRef}
                placeholder={Locale.User.Card.PasswordPlaceholder}
                onChange={(e) => {
                  setCardPassword(e.currentTarget.value);
                }}
                style={{ display: "inline-block", maxWidth: "70%" }}
              ></input>
            </div>
            <Button
              type="default"
              htmlType="submit"
              block
              loading={exchangeLoading}
              className="login-form-button"
              onClick={exchangeCard}
            >
              {Locale.User.Card.Exchange}
            </Button>
          </ListItem>
        </List>

        <List>
          <ListItem
            title={Locale.User.Finance.Balance}
            subTitle={
              showUsage
                ? loadingUsage
                  ? Locale.Settings.Usage.IsChecking
                  : Locale.Settings.Usage.SubTitle(
                      usage?.used ?? "[?]",
                      usage?.subscription ?? "[?]",
                    )
                : Locale.Settings.Usage.NoAccess
            }
          >
            {!showUsage || loadingUsage ? (
              <div />
            ) : (
              <IconButton
                icon={<ResetIcon></ResetIcon>}
                text={Locale.Settings.Usage.Check}
                onClick={() => checkUsage(true)}
              />
            )}
          </ListItem>

          <ListItem
            title={Locale.User.Finance.Charge}
            subTitle={Locale.User.Finance.SubTitle}
          >
            <IconButton
              icon={<ResetIcon></ResetIcon>}
              text={Locale.Settings.Usage.Check}
              onClick={() => checkUsage(true)}
            />
          </ListItem>
        </List>
        <Button type="primary" danger block onClick={cancleLogin}>
          {Locale.User.CancleLogin}
        </Button>
        {/* <SyncItems />

        {shouldShowPromptModal && (
          <UserPromptModal onClose={() => setShowPromptModal(false)} />
        )} */}
      </div>
    </ErrorBoundary>
  );
}
