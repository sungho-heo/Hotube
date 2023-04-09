import Video from "../models/Video";
import Comment from "../models/Comment";
import User from "../models/User";

// callback 방식을 사용하려는데 최신버전은 callback문법을 사용할수없어서 promise로 구현함.
export const homeVideo = async (req, res) => {
  const videos = await Video.find({}).populate("owner");
  return res.render("home", { pageTitle: "Home", videos: videos });
};

export const watch = async(req, res) => {
  const id = req.params.id;
  const video = await Video.findById(id).populate("owner").populate("comments");
  if (video === null) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  return res.render("watch", { pageTitle: video.title, video: video });
};

export const getEdit = async(req, res) => {
  const id = req.params.id;
  const video = await Video.findById(id);
  const userid = req.session.user._id;
  if (String(video.owner) !== String(userid)) { // video.owner id 는 타입이 다른 그래서 타입도 맞춰줘야함.
    req.flash("error", "Video owner not found.");
    return res.status(403).redirect("/");
  };
  if (video === null) {
    return res.render("404", { pageTitle: "Video not found" })  
  }
  return res.render("videos/edit", { pageTitle: `Editing:${video.title}`,video:video});
};

export const postEdit = async(req, res) => {
  const id = req.params.id
  const userid = req.session.user._id;
  const title = req.body.title
  const description = req.body.description
  const hashtags = req.body.hashtags
  const video = await Video.find({ _id: id });
  if (video._id === null) {
    return res.status(404).render("404", { pageTitle: "Video not found" })
  }
  if (String(video[0].owner) !== String(userid)) {// video.owner id 는 타입이 다른 그래서 타입도 맞춰줘야함.
    req.flash("error", "Video owner not found.");
    return res.status(403).redirect("/")
  }
  await Video.findByIdAndUpdate(id, {
    title: title,
    description: description,
    hashtags: Video.formatHashtags(hashtags),
  })
  req.flash("success", "Changes saved.");
  return res.redirect(`/videos/${id}`)
};

export const getUpload = (req, res) => {
  return res.render("videos/upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const id = req.session.user._id;
  const fileUrl = req.files.video;
  const thumbUrl = req.files.thumbnail;
  const title = req.body.title;
  const description = req.body.description;
  const hashtags = req.body.hashtags;
  try {
    const updateVideo = await Video.create({
      title: title,
      owner: id,
      fileUrl: fileUrl[0].path,
      thumbUrl: thumbUrl[0].path,
      description: description,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(id);
    user.videos.push(updateVideo.id);
    user.save();
  } catch (error) {
    return res.status(400).render("videos/upload", { pageTitle: "Upload Video", errorMessage: error._message });
  }
  return res.redirect("/");
};

export const deleteVideo = async (req, res) => {
  const userid = req.session.user._id;
  const id = req.params.id;
  const video = await Video.findById(id);
  if (!video) {
      return res.status(404).render("404", { pageTitle: "Video not found." });
  };
  if (String(video.owner) !== String(userid)) {
      // video.owner id 는 타입이 다른 그래서 타입도 맞춰줘야함.
    req.flash("error", "Video owner not found.");
    return res.status(403).redirect("/");
  };
  const user = await User.findById(userid);
  if (!user) {
    return res.sendStatus(404);
  };
  user.videos.splice(user.videos.indexOf(video._id),1);
  user.save();
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async(req, res) => {
  let video = [];
  const keyword = req.query.keyword;
  if (keyword) {
    video = await Video.find({
      title: {
        $regex: new RegExp(`^${keyword}`,"i")
      }
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos:video });
};

export const pageViewCount = async (req, res) => {
  const id = req.params.id;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  };
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const id = req.params.id;
  const text = req.body.text;
  const video = await Video.findById(id);
  const user = req.session.user;
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text: text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({commentId: comment._id});
};

export const deleteComment = async (req, res) => {
  const id = req.params.id;
  const userId = req.session.user._id;
  const comment = await Comment.findById(id);
  if (String(comment.owner) !== String(userId)) {
    return res.sendStatus(404);
  }
  const video = await Video.findById(comment.video);
  video.comments.splice(video.comments.indexOf(comment._id),1);
  video.save();

  await Comment.findByIdAndDelete(comment._id);
  return res.sendStatus(200);
}

  
