// @ts-nocheck
import styles from "./login.module.scss";
import "./login.css";
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

import { LockOutlined, MobileOutlined, MailOutlined } from "@ant-design/icons";
import {
  ConfigProvider,
  Tabs,
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  message,
} from "antd";
import { Get, Post } from "../api/request/http";
import { useState, useRef } from "react";

export function LoginPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const access = useAccessStore();

  const goHome = () => navigate(Path.Home);

  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // gpt-key赋值
  const updateGpt = () => {
    const url = "https://api.openai-proxy.org";
    const key: any = localStorage.getItem("gpt-key");
    access.updateOpenAiUrl(url);
    if (key != "1") {
      access.updateToken(key.slice(0, -1));
    }
  };
  const loginWithCode = async (values: any) => {
    const res = await Post("/login", {
      phone: values["phone-login"],
      password: values["password-login"],
    });
    if (res.status === true) {
      // token本地存储
      localStorage.setItem("token", res.data.token);
      // key不存在，存1；存在+1
      if (res.data.key === "null" || !res.data.key) {
        localStorage.setItem("gpt-key", "1");
      } else {
        localStorage.setItem("gpt-key", res.data.key + "1");
      }
      updateGpt();
      messageApi.open({
        type: "success",
        content: "登录成功",
      });
      goHome();
    } else {
      messageApi.open({
        type: "error",
        content: res.msg,
      });
    }
    console.log("Received values of form: ", values, res);
  };
  const loginWithSMS = async (value: any) => {
    // 登录
    if (value["sms-login-sms"]) {
      setLoadingLogin(true);
      let res = await Post("/login2", {
        phone: value["phone-login-sms"],
        sms: value["sms-login-sms"],
      });
      if (res.status) {
        messageApi.open({
          type: "success",
          content: res.msg,
        });
        goHome();
      } else {
        messageApi.open({
          type: "error",
          content: res.msg,
        });
      }
      setLoadingLogin(false);
      console.log("短信登录", value);
    } else {
      sendSmsLogin();
    }
  };

  const [sendLoginSmsStatus, setSendLoginSmsStatus] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingLoginSms, setLoadingLoginSms] = useState(false);

  const loginPhoneInputRef = useRef(null);
  const loginTimer = useRef(null);
  const [loginTime, setLoginTime] = useState(0);

  useEffect(() => {
    if (loginTime === seconds) {
      loginTimer.current = setInterval(
        () => setLoginTime((loginTime) => --loginTime),
        1000,
      );
    } else if (loginTime <= 0) {
      loginTimer.current && clearInterval(loginTimer.current);
    }
  }, [loginTime]);

  const sendSmsLogin = async () => {
    let phone = loginPhoneInputRef.current.input.value;
    setLoadingLoginSms(true);
    let res = await Post("/api/sms", {
      phone,
      type: "2",
    });
    // let res = {status: true}
    if (res.status) {
      messageApi.open({
        type: "success",
        content: res.msg,
      });
      setLoginTime(60);
      setSendLoginSmsStatus(true);
    } else {
      messageApi.open({
        type: "error",
        content: res.msg,
      });
    }
    setLoadingLoginSms(false);
  };

  const loginForm = (textInfo: any) => {
    return (
      <>
        {textInfo.type === "password" ? (
          <Form
            name="normal_login_password"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={loginWithCode}
          >
            <Form.Item
              name="phone-login"
              rules={[{ required: true, message: textInfo.require1 }]}
            >
              <Input
                className="input-length"
                prefix={<MobileOutlined className="site-form-item-icon" />}
                placeholder={textInfo.input1}
              />
            </Form.Item>
            <Form.Item
              name="password-login"
              rules={[{ required: true, message: textInfo.require2 }]}
            >
              <Input.Password
                className="input-length"
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
          </Form>
        ) : (
          <Form
            name="normal_login_sms"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={loginWithSMS}
          >
            <Form.Item
              name="phone-login-sms"
              rules={[{ required: true, message: textInfo.require1 }]}
            >
              <Input
                className="input-length"
                ref={loginPhoneInputRef}
                prefix={<MobileOutlined className="site-form-item-icon" />}
                placeholder={textInfo.input1}
              />
            </Form.Item>
            {sendLoginSmsStatus ? (
              <Form.Item
                name="sms-login-sms"
                rules={[{ required: true, message: textInfo.require2 }]}
              >
                <Input
                  className="input-length"
                  prefix={<MailOutlined className="site-form-item-icon" />}
                  placeholder={textInfo.input2}
                />
              </Form.Item>
            ) : null}
            {sendLoginSmsStatus ? (
              <Form.Item>
                <Button
                  key="submit"
                  htmlType="submit"
                  loading={loadingLogin}
                  className="login-register-button"
                >
                  {textInfo.confirm}
                </Button>
                <Button
                  onClick={sendSmsLogin}
                  className="sms-again-button"
                  disabled={loginTime}
                >
                  {loginTime
                    ? `${Locale.Login.Register.ReSmsButton}(${loginTime})`
                    : Locale.Login.Register.ReSmsButton}
                </Button>
              </Form.Item>
            ) : (
              <Form.Item>
                <Button
                  type="default"
                  htmlType="submit"
                  block
                  loading={loadingLoginSms}
                  className="login-form-button"
                >
                  {textInfo.sendSms}
                </Button>
              </Form.Item>
            )}
          </Form>
        )}
      </>
    );
  };
  // 生成tab list
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
  const [tabList, setTabList] = useState([]);
  useEffect(() => {
    setTabList(generateTabList());
  }, [sendLoginSmsStatus, loginTime]);

  // 注册函数
  const [openRegister, setOpenRegister] = useState(false);
  const [confirmLoadingRegister, setConfirmLoadingRegister] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingSms, setLoadingSms] = useState(false);

  const [sendSmsStatus, setSendSmsStatus] = useState(false);
  // 倒计时
  const [time, setTime] = useState(0);
  const timer = useRef(null);
  const phoneInputRef = useRef(null);
  const seconds = 60;
  useEffect(() => {
    if (time === seconds) {
      timer.current = setInterval(() => setTime((time) => --time), 1000);
    } else if (time <= 0) {
      timer.current && clearInterval(timer.current);
    }
  }, [time]);
  // 点击提交按钮
  const handleOkRegister = async (values: any) => {
    console.log("点击弹窗确定");
    console.log(values);
    if (values["sms-register"]) {
      console.log("点击注册");
      setLoadingRegister(true);
      let res = await Post("/api/register", {
        phone: values["phone-register"],
        password: values["password-register"],
        sms: values["sms-register"],
      });
      if (res.status === true) {
        messageApi.open({
          type: "success",
          content: res.msg,
        });
        // 关闭弹窗
        handleCancelRegister();
      } else {
        messageApi.open({
          type: "error",
          content: res.msg,
        });
        setLoadingRegister(false);
      }
      // console.log(res, '---注册---')
    } else {
      // console.log(phoneInputRef.current.input.value, '========phone-input=========')
      // console.log("发送验证码");
      if (time) {
        return;
      } else {
        sendSmsRegister();
      }
    }
    // setOpenRegister(false)
  };
  const handleCancelRegister = () => {
    console.log("点击弹窗取消");
    setOpenRegister(false);
    setSendSmsStatus(false);
  };
  const sendSmsRegister = async () => {
    let phone = phoneInputRef.current.input.value;
    setLoadingSms(true);
    let res = await Post("/api/sms", {
      phone,
      type: "1",
    });
    console.log("发送短信验证码", res);
    if (res.status) {
      messageApi.open({
        type: "success",
        content: res.msg,
      });
      setTime(60);
      setSendSmsStatus(true);
    } else {
      messageApi.open({
        type: "error",
        content: res.msg,
      });
    }
    setLoadingSms(false);
  };
  return (
    <div className={styles["auth-page"]}>
      {contextHolder}
      <div
        className={`no-dark ${styles["auth-logo"]}`}
        style={{ marginBottom: "20px" }}
      >
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
        {Locale.Login.Tips}
        <a
          onClick={() => setOpenRegister(true)}
          style={{ color: "#551a8b", textDecoration: "underline" }}
        >
          {Locale.Login.Register.Title}
        </a>
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
              defaultBorderColor: "#1a859a",
              defaultColor: "#fff",
              textHoverBg: "red",
            },
          },
        }}
      >
        <Modal
          title={Locale.Login.Register.Title}
          open={openRegister}
          centered
          onOk={handleOkRegister}
          confirmLoading={confirmLoadingRegister}
          onCancel={handleCancelRegister}
          className="register-model"
          footer={[]}
        >
          <Form
            name="normal_register"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={handleOkRegister}
          >
            <Form.Item
              name="phone-register"
              label={Locale.Login.Register.PhoneText}
              rules={[
                { required: true, message: Locale.Login.Register.PhoneMsg },
              ]}
            >
              <Input
                ref={phoneInputRef}
                className="input-length"
                prefix={<MobileOutlined className="site-form-item-icon" />}
                placeholder={Locale.Login.Register.PhonePlaceholder}
              />
            </Form.Item>
            <Form.Item
              name="password-register"
              label={Locale.Login.Register.PasswordText}
              rules={[
                { required: true, message: Locale.Login.Register.PasswordMsg },
              ]}
            >
              <Input.Password
                className="input-length"
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder={Locale.Login.Register.PasswordPlaceholder}
              />
            </Form.Item>
            {sendSmsStatus ? (
              <Form.Item
                name="sms-register"
                label={Locale.Login.Register.SmsText}
                rules={[
                  { required: true, message: Locale.Login.Register.SmsMsg },
                ]}
              >
                <Input
                  className="input-length"
                  prefix={<MailOutlined className="site-form-item-icon" />}
                  type="text"
                  placeholder={Locale.Login.Register.SmsPlaceholder}
                />
              </Form.Item>
            ) : null}
            {sendSmsStatus ? (
              <Form.Item>
                <Button
                  key="submit"
                  htmlType="submit"
                  loading={loadingRegister}
                  className="login-register-button"
                >
                  {Locale.Login.Register.OkText}
                </Button>
                <Button
                  onClick={sendSmsRegister}
                  className="sms-again-button"
                  disabled={time}
                >
                  {time
                    ? `${Locale.Login.Register.ReSmsButton}(${time})`
                    : Locale.Login.Register.ReSmsButton}
                </Button>
              </Form.Item>
            ) : (
              <Button
                htmlType="submit"
                block
                loading={loadingSms}
                className="login-form-button"
              >
                {Locale.Login.Register.SmsButton}
              </Button>
            )}
          </Form>
        </Modal>

        <Tabs defaultActiveKey="1" centered size="large" items={tabList} />
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
