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
    // access.updateOpenAiUrl(url);
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

  // 服务条款相关
  const [showLegal, setShowLegal] = useState(false);
  // 找回密码
  const [showFindPassword, setShowFindPassword] = useState(false);
  const [changeSmsStatus, setChangeSmsStatus] = useState(false);
  const [loadingChangeSms, setLoadingChangeSms] = useState(false);
  const [loadingChange, setLoadingChange] = useState(false);
  const changeTimer = useRef(null);
  const [changeTime, setChangeTime] = useState(0);

  useEffect(() => {
    if (changeTime === seconds) {
      changeTimer.current = setInterval(
        () => setChangeTime((changeTime) => --changeTime),
        1000,
      );
    } else if (changeTime <= 0) {
      changeTimer.current && clearInterval(changeTimer.current);
    }
  }, [changeTime]);

  const handleCancelChange = () => {
    setShowFindPassword(false);
    setChangeSmsStatus(false);
  };
  const sendSmsChange = async (phone) => {
    setLoadingChangeSms(true);
    let res = await Post("/api/sms", {
      phone,
      type: "3",
    });
    if (res.status) {
      messageApi.open({
        type: "success",
        content: res.msg,
      });
      setChangeTime(60);
      setChangeSmsStatus(true);
    } else {
      messageApi.open({
        type: "error",
        content: res.msg,
      });
    }
    setLoadingChangeSms(false);
  };
  const handleOkPassword = async (values) => {
    console.log("提交修改密码");
    if (values["sms-change"]) {
      setLoadingChange(true);
      let res = await Post("/api/new-password", {
        phone: values["phone-change"],
        password: values["password-change"],
        sms: values["sms-change"],
      });
      if (res.status === true) {
        messageApi.open({
          type: "success",
          content: res.msg,
        });
        // 关闭弹窗
        handleCancelChange();
      } else {
        messageApi.open({
          type: "error",
          content: res.msg,
        });
      }
      setLoadingChange(false);
    } else {
      if (time) {
        return;
      } else {
        sendSmsChange(values["phone-change"]);
      }
    }
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
          <a
            onClick={() => setShowLegal(true)}
            style={{ color: "#551a8b", textDecoration: "underline" }}
          >
            {Locale.Login.LegalLink}
          </a>
        </div>
        <Modal
          title={Locale.Login.LegalLink}
          centered
          open={showLegal}
          onCancel={() => setShowLegal(false)}
          className="register-model"
          footer={[]}
        >
          <div style={{ height: "60vh", overflow: "scroll" }}>
            <p>
              在使用本网站提供的服务前，请您务必仔细阅读并理解本《服务条款》（以下简称"本条款”）。
            </p>
            <p>
              请您知悉，如果您选择继续访问本网站、或使用本网站提供的本服务以及通过各类方式利用本网站的行为（以下统称"本服务"），则视为接受并同意本条款全部内容。
            </p>
            <ol style={{ margin: 0, padding: 0 }}>
              <li>
                <p>
                  本网站旨在辅助您更高效的工作和学习，解决您工作和学习中遇到的问题。为了维护互联网安全和健康发展，以及保障您的人个权益，我们郑重提醒您：
                </p>
                <p>
                  您在使用本服务时，必须以善意且谨慎的态度行事；不得利用本服务故意或者过失的从事危害国家安全和社会公共利益、扰乱经济秩序和社会秩序、侵犯他人合法权益等法律、行政法规禁止的活动，请勿输入、生成并发布、输出、传播涉及国家法律法规禁止以下内容：
                </p>
                <ol type="a" style={{ margin: "0 0 0 10px", padding: 0 }}>
                  <li>
                    危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；
                  </li>
                  <li>损害国家荣誉和利益的；</li>
                  <li>
                    歪曲、丑化、亵渎、否定英雄烈士事迹和精神，以侮辱、诽谤或者其他方式侵害英雄烈士的姓名、肖像、名誉、荣誉的；
                  </li>
                  <li>
                    宣扬恐怖主义、极端主义或者煽动实施恐怖活动、极端主义活动的；
                  </li>
                  <li>煽动民族仇恨、民族歧视，破坏民族团结的；</li>
                  <li>破坏国家宗教政策，宣扬邪教和封建迷信的；</li>
                  <li>散布谣言，扰乱经济秩序和社会秩序的；</li>
                  <li>
                    散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；
                  </li>
                  <li>
                    侮辱或者诽谤他人，侵害他人名誉、隐私和其他合法权益的；
                  </li>
                  <li>
                    含有虚假、有害、胁迫、侵害他人隐私、骚扰、侵害、中伤、粗俗、猥亵、或其它道德上令人反感的内容；
                  </li>
                  <li>
                    中国法律、法规、规章、条例以及任何具有法律效力之规范所限制或禁止的其它内容。
                  </li>
                </ol>
              </li>
              <li>
                <p>
                  您同意并承诺，在使用本服务时，严格遵守国家及行业相关法律法规要求，不上传国家及金融行业涉密文件及数据、不上传非公开的资料及数据、客户资料、支付清算基础设施或系统的核心代码等内容，不会输入个人隐私信息。
                </p>
              </li>
              <li>
                <p>
                  为最大限度限制敏感内容，并保证服务持续，我们有权拒绝回复涉及敏感信息的问题，若回复中包含敏感信息，我们会对敏感内容做过滤或删除处理，不能保证回复的完整性，同时会记录您的IP，如发现违法使用，本站将全力配合有关部门予以打击！
                </p>
              </li>
              <li>
                <p>
                  为保护您的个人隐私，您的个人身份数据请妥善保管，避免泄漏。
                </p>
              </li>
              <li>
                <p>
                  您确认并知悉本服务生成的所有内容都是由人工智能模型生成，所以可能会出现意外和错误的情况，请确保检查事实，我们对其生成内容的准确性、完整性和功能性不做也无法做出任何保证，并且其生成的内容不代表我们的态度或观点，仅为提供更多信息，也不构成任何建议或承诺。对于您根据本服务提供的信息所做出的一切行为，除非另有明确的书面承诺文件，否则我们不承担任何形式的责任。
                </p>
              </li>
              <li>
                <p>
                  本服务来自于法律法规允许的包括但不限于公开互联网等信息积累，因互联网的开放性属性，不排除其中部分信息具有瑕疵、不合理或引发不快。遇有此情形的，欢迎并感谢您随时通过联系方式进行举报。
                </p>
              </li>
              <li>
                <p>
                  不论在何种情况下，本网站均不对由于网络连接故障，电力故障，罢工，劳动争议，暴乱，起义，骚乱，火灾，洪水，风暴，爆炸，不可抗力，战争，政府行为，国际、国内法院的命令，黑客攻击，互联网病毒，网络运营商技术调整，政府临时管制或任何其他不能合理控制的原因而造成的本服务不能访问、服务中断、信息及数据的延误、停滞或错误，不能提供或延迟提供服务而承担责任。
                </p>
              </li>
            </ol>{" "}
            <p>
              本服务以链接形式推荐其他网站内容时，我们并不对这些网站或资源的可用性负责，且不保证从这些网站获取的任何内容、产品、服务或其他材料的真实性、合法性。在法律允许的范围内，本网站不承担您就使用本服务所提供的信息或任何链接所引致的任何直接、间接、附带、从属、特殊、继发、惩罚性或惩戒性的损害赔偿。
            </p>
          </div>
        </Modal>
        <div className={styles["login-findp"]}>
          <a
            onClick={() => setShowFindPassword(true)}
            style={{ color: "#551a8b", textDecoration: "underline" }}
          >
            {Locale.Login.FindPassword}
          </a>
        </div>
        <Modal
          title={Locale.Login.ChangePassword}
          centered
          open={showFindPassword}
          onCancel={() => setShowFindPassword(false)}
          className="register-model"
          footer={[]}
        >
          <Form
            name="change-password"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={handleOkPassword}
          >
            <Form.Item
              name="phone-change"
              label={Locale.Login.Register.PhoneText}
              rules={[
                { required: true, message: Locale.Login.Register.PhoneMsg },
              ]}
            >
              <Input
                className="input-length"
                prefix={<MobileOutlined className="site-form-item-icon" />}
                placeholder={Locale.Login.Register.PhonePlaceholder}
              />
            </Form.Item>
            <Form.Item
              name="password-change"
              label={Locale.Login.ChangePassword}
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
            {changeSmsStatus ? (
              <Form.Item
                name="sms-change"
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
            {changeSmsStatus ? (
              <Form.Item>
                <Button
                  key="submit"
                  htmlType="submit"
                  loading={loadingChange}
                  className="login-register-button"
                >
                  {Locale.Login.ChangeConfirm}
                </Button>
                <Button
                  onClick={sendSmsRegister}
                  className="sms-again-button"
                  disabled={changeTime}
                >
                  {changeTime
                    ? `${Locale.Login.Register.ReSmsButton}(${changeTime})`
                    : Locale.Login.Register.ReSmsButton}
                </Button>
              </Form.Item>
            ) : (
              <Button
                type="default"
                htmlType="submit"
                block
                loading={changeSmsStatus}
                className="login-form-button"
              >
                {Locale.Login.Register.SmsButton}
              </Button>
            )}
          </Form>
        </Modal>
      </ConfigProvider>
    </div>
  );
}
