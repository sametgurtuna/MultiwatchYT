function addVideo() {
  var youtubeLink = document.getElementById("youtubeLink").value;
  var videoId = extractVideoId(youtubeLink);
  var main = document.getElementById("videoContainer");

  var iframe = document.createElement("iframe");
  iframe.setAttribute(
    "src",
    "https://www.youtube.com/embed/" + videoId + "?autoplay=1"
  );
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allowfullscreen", "true");

  var closeButton = document.createElement("button");
  closeButton.innerText = "×";
  closeButton.classList.add("closeButton");
  closeButton.addEventListener("click", function () {
    main.removeChild(div);
    adjustVideoSizes(); // Videoları kaldırdıktan sonra boyutları tekrar ayarla
  });

  var div = document.createElement("div");
  div.classList.add("video");
  div.appendChild(iframe);
  div.appendChild(closeButton);

  main.appendChild(div);

  adjustVideoSizes(); // Yeni video ekledikten sonra boyutları ayarla
}

function extractVideoId(url) {
  var videoId = "";
  if (url.includes("v=")) {
    videoId = url.split("v=")[1];
    var ampersandPosition = videoId.indexOf("&");
    if (ampersandPosition !== -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1];
    var slashPosition = videoId.indexOf("/");
    if (slashPosition !== -1) {
      videoId = videoId.substring(0, slashPosition);
    }
  }
  return videoId;
}

function adjustVideoSizes() {
  var videos = document.querySelectorAll(".video");
  var numVideos = videos.length;

  videos.forEach(function (video) {
    video.style.flexBasis = "calc(" + 100 / numVideos + "% - 20px)";
  });
}
