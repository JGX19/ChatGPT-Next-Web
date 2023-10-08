import styles from "./login.module.scss";
import { IconButton } from "./button";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";
import spqlogo from "../icons/spq.png";
import { useEffect } from "react";
import { getClientConfig } from "../config/client";
import { api } from "../client/api";

import { React } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { ConfigProvider, Tabs, Button, Checkbox, Form, Input } from "antd";

export function LoginPage() {
  const navigate = useNavigate();
  const access = useAccessStore();

  const goHome = () => navigate(Path.Home);

  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onFinish = (values: any) => {
    console.log("Received values of form: ", values);
  };
  const loginForm = (textInfo) => {
    return (
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: textInfo.require1 }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder={textInfo.input1}
          />
        </Form.Item>
        {textInfo.type === "password" ? (
          <>
            <Form.Item
              name="password"
              rules={[{ required: true, message: textInfo.require2 }]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type={textInfo.input2.includes("密码") ? "password" : "text"}
                placeholder={textInfo.input2}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="default"
                htmlType="submit"
                block
                className="login-form-button"
              >
                {textInfo.confirm}
              </Button>
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                {textInfo.verify}
              </Button>
            </Form.Item>
            <Form.Item>
              <Button
                type="default"
                htmlType="submit"
                block
                className="login-form-button"
              >
                {textInfo.confirm}
              </Button>
            </Form.Item>
          </>
        )}
      </Form>
    );
  };
  const generateTabList = () => {
    let tabs = new Array(Locale.Login.Tabs[0], Locale.Login.Tabs[1]);
    console.log(tabs, 999);
    return tabs.map((item, i) => {
      return {
        key: i,
        label: item.label,
        children: loginForm(item.children),
      };
    });
  };
  console.log(spqlogo);

  return (
    <div className={styles["auth-page"]}>
      <div className={`no-dark ${styles["auth-logo"]}`}>
        <img
          src={spqlogo.src}
          alt="食品圈logo"
          className={styles["corp-logo"]}
        />
        <span style={{ color: "#1d93ab" }}>x</span>
        <BotIcon />
        {/* <BotIcon />x<img src={require("../icons/spq.png")} alt="食品圈logo" /> */}
      </div>

      <div className={styles["auth-title"]}>{Locale.Login.Title}</div>
      <div className={styles["auth-tips"]}>
        {Locale.Login.Tips} <a href="">{Locale.Login.Register}</a>
      </div>

      <ConfigProvider
        theme={{
          components: {
            Tabs: {
              inkBarColor: "#1d93ab",
              itemActiveColor: "#1d93ab",
              itemHoverColor: "#1d93ab",
              itemSelectedColor: "#1d93ab",
            },
            Button: {
              defaultBg: "#1a859a",
              defaultColor: "#fff",
              textHoverBg: "red",
            },
          },
        }}
      >
        <Tabs
          defaultActiveKey="1"
          centered
          size="large"
          items={generateTabList()}
        />
      </ConfigProvider>

      {/* <input
        className={styles["auth-input"]}
        type="text"
        placeholder={Locale.Login.Input}
        value={access.accessCode}
        onChange={(e) => {
          access.updateCode(e.currentTarget.value);
        }}
      />
      <input
      className={styles["auth-input"]}
      type="password"
      placeholder={Locale.Auth.Input}
      value={access.accessCode}
      onChange={(e) => {
        access.updateCode(e.currentTarget.value);
      }}
    /> */}

      {/* <div className={styles["auth-actions"]}>
        <IconButton
          text={Locale.Auth.Confirm}
          type="primary"
          onClick={goHome}
        />
        <IconButton text={Locale.Auth.Later} onClick={goHome} />
      </div> */}
      <div className={styles["login-legal"]}>
        {Locale.Login.Legal}
        <a href="">{Locale.Login.LegalLink}</a>
      </div>
      <div className={styles["login-findp"]}>
        <a href="">{Locale.Login.FindPassword}</a>
      </div>
    </div>
  );
}
