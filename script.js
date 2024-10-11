let currentSong = new Audio();
let songs;
let currFolder;

function convertSecondsToMinutes(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60); // Round the seconds

  // Ensure both minutes and seconds are always two digits
  minutes = minutes < 10 ? "0" + minutes : minutes;
  remainingSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return minutes + ":" + remainingSeconds;
}

async function getsong(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let songLinks = div.querySelectorAll("#files a");
  songs = [];

  songLinks.forEach((element) => {
    let href = element.href;
    if (href.endsWith(".mp3")) {
      songs.push(href.split(`http://127.0.0.1:5500/${folder}/`)[1]); // Extract song name from the URL
    }
  });

  console.log("Songs found:", songs);

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `<li> 
                                <img class="invert" src="music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div>Fareed</div>
                                </div>
                                <div class="playnow">
                                    <span>Play now</span>
                                    <img class="invert" src="play.svg" alt="">
                                </div> 
                             </li>`;
  }

  // Attach click event to each song item
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      let songName = e
        .querySelector(".info")
        .firstElementChild.innerHTML.trim();
      console.log("Now playing:", songName);
      playMusic(songName);
    });
  });
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"; // Reset time display at the start

  // Update the song duration when metadata is loaded
  currentSong.addEventListener("loadedmetadata", () => {
    const durationFormatted = convertSecondsToMinutes(currentSong.duration);
    document.querySelector(
      ".songtime"
    ).innerHTML = `00:00 / ${durationFormatted}`;
  });
};

async function diplayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = document.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer")
  Array.from(anchors).forEach(async (e) => {
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      //    get the metadata for this folder
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      cardcontainer.innerHTML =
        cardcontainer.innerHTML +
        `  <div data-folder = "cs" class="card">
                    <div  class="play">
                        <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                            
                            <circle cx="25" cy="25" r="24" fill="#00ff00" stroke="none" />
                            
                          
                            <path d="M20 34V16L34 25L20 34Z" stroke="black" stroke-width="1.5" stroke-linejoin="round" fill="#i fdf64"/>
                          </svg>
                          
                        
                          
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
    }
  });
}

async function main() {
  await getsong("songs/ncs");
  playMusic(songs[0], true);

  // Diplay all the albums on the page
  diplayAlbums();

  // Attach event listener to play/pause button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // Update time display during song play in the format 00:12 / 00:12
  currentSong.addEventListener("timeupdate", () => {
    const currentTimeFormatted = convertSecondsToMinutes(
      currentSong.currentTime
    );
    const durationFormatted = convertSecondsToMinutes(currentSong.duration);

    // Display current time and total duration
    document.querySelector(
      ".songtime"
    ).innerHTML = `${currentTimeFormatted} / ${durationFormatted}`;

    // Move the circle based on the song progress
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Reset play button and time display when the song ends
  currentSong.addEventListener("ended", () => {
    play.src = "play.svg";
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
  });

  // add an event listner to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // add an event listner for hamburger:

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listner for close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listner to  previous:

  previous.addEventListener("click", () => {
    console.log("previous clicked");
    console.log(currentSong);
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    console.log(songs, index);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add event listner to next:
  next.addEventListener("click", () => {
    console.log("Next clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    console.log(songs, index);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event listner to volume:

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/ 100");
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  // Load the playlist whenever card is clicked:
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    console.log(e);
    e.addEventListener("click", async (item) => {
      console.log(item.target, item.currentTarget.dataset);
      songs = await getsong(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}

main();
