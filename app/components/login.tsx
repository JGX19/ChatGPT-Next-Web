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
import { useState } from "react";

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
      phone: values.phone,
      password: values.password,
    });
    if (res.status === true) {
      // token本地存储
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("gpt-key", res.data.key + "1");
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
  const loginWithSMS = (value: any) => {
    Post("/login2", {
      phone: "17561688631",
      password: "88888888",
    });
    console.log("短信登录", value);
  };
  const loginForm = (textInfo) => {
    return (
      <>
        {textInfo.type === "password" ? (
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={loginWithCode}
          >
            <Form.Item
              name="phone-login"
              rules={[{ required: true, message: textInfo.require1 }]}
            >
              <Input
                prefix={<MobileOutlined className="site-form-item-icon" />}
                placeholder={textInfo.input1}
              />
            </Form.Item>
            <Form.Item
              name="password-login"
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
          </Form>
        ) : (
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={loginWithSMS}
          >
            <Form.Item
              name="phone-login-sms"
              rules={[{ required: true, message: textInfo.require1 }]}
            >
              <Input
                prefix={<MobileOutlined className="site-form-item-icon" />}
                placeholder={textInfo.input1}
              />
            </Form.Item>
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
  }, []);

  // 注册函数
  const [openRegister, setOpenRegister] = useState(false);
  const [confirmLoadingRegister, setConfirmLoadingRegister] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  const [sendSmsStatus, setSendSmsStatus] = useState(false);
  const handleOkRegister = (values) => {
    console.log("点击弹窗确定");
    console.log(values);
    if (values["sms-register"]) {
      console.log("点击注册");
    } else {
      console.log("发送验证码");
    }
    // setOpenRegister(false)
  };
  const handleCancelRegister = () => {
    console.log("点击弹窗取消");
    setOpenRegister(false);
    setSendSmsStatus(false);
  };
  const sendSms = () => {
    console.log("发送短信验证码");
    setSendSmsStatus(true);
  };
  return (
    <div className={styles["auth-page"]}>
      {contextHolder}
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
          footer={
            [
              // <Button key="submit" block loading={loadingRegister} onClick={handleOkRegister}
              // className="login-form-button">
              //   {Locale.Login.Register.OkText}
              // </Button>,
              // <Button key="back" block onClick={handleCancelRegister} style={{marginInlineStart: 0, marginTop: '10px'}}>
              //   {Locale.Login.Register.CancelText}
              // </Button>,
            ]
          }
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
              <Input
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
                  block
                  loading={loadingRegister}
                  onClick={handleOkRegister}
                  className="login-form-button"
                >
                  {Locale.Login.Register.OkText}
                </Button>
              </Form.Item>
            ) : (
              <Button
                htmlType="submit"
                block
                loading={loadingRegister}
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
