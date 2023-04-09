const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteComment = document.getElementsByClassName("video__comment-delete");


const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.className = "video__comment";
    newComment.dataset.id = id;
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    const btn = document.createElement("span");
    span.innerText = ` ${text}`;
    btn.innerText = " ❌";
    btn.className = "video__comment-delete";
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(btn);
    videoComments.prepend(newComment);
    btn.addEventListener("click", handleBtndelete);
}

const handleSubmit = async (event) => {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const id = videoContainer.dataset.id;
    if (text.trim() === "") {
        return ;
    }
    const response = await fetch(`/api/videos/${id}/comment`, {
        method: 'POST',
        headers: {
            'Content-Type': "application/json",
    },
        body: JSON.stringify({text:text}),
    });
    if (response.status === 201) {
        textarea.value = "";
        const commentId = await response.json();
        const id = commentId.commentId;
        addComment(text, id);
    }
};

if (form) {
    form.addEventListener("submit", handleSubmit);
};

const handleBtndelete = async (event) => {
    const li = event.target.parentNode;
    const commentId = li.dataset.id;
    const response =await fetch(`/api/videos/${commentId}/comment/delete`, {
        method: "DELETE",
    })
    if (response.status === 200) {
        li.remove();
    }
};


if (deleteComment) {
    for (const value of deleteComment) {
        value.addEventListener("click", handleBtndelete);
    }
};