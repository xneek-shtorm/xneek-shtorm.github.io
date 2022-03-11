function initPlayer() {
    var video1 = document.getElementById("video1");
    var video2 = document.getElementById("video2");
	var files = document.getElementById("input1");

	video1.onplay = () => { video2.play() }
	video1.onpause = () => { video2.pause() }
	video1.onseeked = () => { video2.currentTime = video1.currentTime; }
	video1.onseeking = () => { video2.currentTime = video1.currentTime; }

	files.addEventListener("change", function() {
	  var media = URL.createObjectURL(this.files[0]);
	  var media2 = URL.createObjectURL(this.files[1]);

	  video1.src = media;
	  video2.src = media2;
	});
}

document.addEventListener("DOMContentLoaded", initPlayer);