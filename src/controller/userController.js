import User from "../models/User.js";
import Video from "../models/Video.js";
import fetch from "cross-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => {
  return res.render("join", { pageTitle: "Join" });
};
export const postJoin = async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  const nickname = req.body.nickname;
  const location = req.body.location;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle: pageTitle,
      errorMessage: "Password confirmation does not match ",
    });
  };
  const exists = await User.exists({
    $or: [{ email: email, username: username, nickname: nickname }],
  });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle: pageTitle,
      errorMessage: "The email/username/nickname alrady taken",
    });
  };
  try {
    await User.create({
      email: email,
      username: username,
      password: password,
      nickname: nickname,
      location: location,
    });
  } catch (error) {
    return res
      .status(400)
      .render("join", { pageTitle: pageTitle, errorMessage: error._message });
  }
  return res.redirect("/login");
};
export const getLogin = (req, res) => {
  return res.render("login", {pageTitle:"Log in"});
};

export const postLogin = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const pageTitle = "Log in"
  const user = await User.findOne({ username: username, socialOnly: false });
  if (!user) {
    return res
      .status(400)
      .render("login", {
        pageTitle: pageTitle,
        errorMessage: "An account with this username does not exists.",
      })
  }
  // 해싱된 password와 사용자가 적은 password가 일치하는지 확인을 위해 사용자가 적은 password또한 해싱을 진행후 동일한 password인지 확인함.
  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    return res
      .status(400)
      .render("login", { pageTitle: pageTitle, errorMessage: "Wrong Password" })
  };
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const githubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_ID,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const connectUrl = `${baseUrl}?${params}`;
  return res.redirect(connectUrl);
};

export const githubCallback = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_ID,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const connectUrl = `${baseUrl}?${params}`;
  const getToken =await (await fetch(connectUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  })
  ).json();
  if ("access_token" in getToken) {
    const accessToken = getToken.access_token;
    const getRequestUrl = "https://api.github.com";
    const userRequest = await (
      await fetch(`${getRequestUrl}/user`, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
      })
    ).json();
    const emailRequest = await (await fetch(`${getRequestUrl}/user/emails`, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    })).json();
    const emailObj = emailRequest.find((email) => email.primary === true && email.verified === true);
    if (!emailObj) {
      return res.redirect("/login", { errorMessage: "Email doesn't exist." });
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
/* 
    db에서 유저가 해당사이트의 가입을한 회원인지 확인을 하기위함 해당 가입 유저일경우 email값이 github와 일치시 바로 로그인 진행 불일치시
    깃허브에서 데이터를 받아와서 가입 진행후 바로 로그인해줌.
*/
      user = await User.create({
        username: userRequest.login,
        avatar_url: userRequest.avatar_url,
        email: emailObj.email,
        nickname: userRequest.name,
        password: "",
        socialOnly: true,
        location: userRequest.location,
      });
    };
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.loggedIn = false;
  // req.session.destroy();
  req.flash("info", "See you later");
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("users/edit-profile", {pageTitle:"Edit-Profile"});
};

export const postEdit = async (req, res) => {
  const id = req.session.user._id;
  const avatarUrl = req.session.user.avatarUrl;
  const email = req.body.email;
  const username = req.body.username;
  const nickname = req.body.nickname;
  const location = req.body.location;
  const updateEmail = req.session.user.email;
  const updateUsername = req.session.user.username;
  const file = req.file;
  if (email !== updateEmail || username !== updateUsername) {
    const findUser = await User.findOne({
      $or: [{ email: updateEmail, username: updateUsername }],
    });
    if (findUser) {
      return res.status(400).render("users/edit-profile", {
        pageTitle: "Edit-Profile",
        errorMessage: `${email}/${username} is already token`,
      })
    };
  };
  const userUpdate = await User.findByIdAndUpdate(
    id,
    {
      avatarUrl: file ?  file.path : avatarUrl, 
      email: email,
      username: username,
      nickname: nickname,
      location: location,
    },
    { new: true }
  )
  req.session.user = userUpdate
  return res.render("users/edit-profile", {pageTitle: "Edit-Profile"});
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly) {
    req.flash("error", "Can't change password");
    return res.redirect("/")
  }
  return res.render("users/change-password", { pageTitle: "Change-Password" });
};

export const postChangePassword = async (req, res) => {
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const newConfirmPassword = req.body.newConfirmPassword;
  const id = req.session.user._id;
  const user = await User.findById(id);
  const checkPassword = await bcrypt.compare(oldPassword, user.password);
  if (!checkPassword) {
        return res.render("users/change-password", {
          pageTitle: "Change-Password",
          errorMessage: "The current password is incorrect.",
        })
  }
  if (newPassword !== newConfirmPassword) {
    return res.render("users/change-password", { pageTitle: "Change-Password", errorMessage: "The Password does not match the new password." });
  };
  user.password = newPassword;
  await user.save();
  return res.redirect("/users/logout");
};

export const userProfile = async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id).populate("videos");
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found" });
  }
  return res.render("users/profile", { pageTitle: user.username, user: user} );
};