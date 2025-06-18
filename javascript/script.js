let currentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00 / 00:00"
    }
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    return songs;

}

// Function to update the playlist UI
function updatePlaylist() {
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""; // Clear existing songs

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + ` <li>  <img class="invert" src="images/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Pandey</div>
                             </div>
                             <div class="playnow"> 
                                <span>Play now</span>
                                <img class="invert" src="images/play.svg" alt="">
                            </div> </li> `;
    }

    // Re-attach event listeners to the new song list
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs;
}

// ✅ Function to update UI and handle play logic
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currfolder}/` + track;

    if (!pause) {
        currentSong.play().then(() => {
            Play.src = "images/pause.svg"; // ✅ Only update icon if play is successful
        }).catch((err) => {
            console.warn("Autoplay blocked:", err);
            Play.src = "images/play.svg"; // ✅ Fallback icon
        });
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
// Card container for albums
async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (
            e.href.includes("/songs/") &&
            !e.href.includes(".htaccess") &&
            !e.href.endsWith("/songs/")
        ) {
            let url = new URL(e.href);
            let parts = url.pathname.split("/").filter(Boolean);
            let folder = parts[parts.length - 1];
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                      <img src="images/player.svg" alt="">
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="cover">
                     <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`

        }
    }
    // Load the playlist whenever card is clicked
   Array.from(document.getElementsByClassName("card")).forEach(e => { 
    e.addEventListener("click", async item => {
        const folderName = item.currentTarget.dataset.folder;
        const folderPath = `songs/${folderName}`;
        
        // Load songs
        songs = await getSongs(folderPath); // ✅ use global songs variable here

        if (Array.isArray(songs) && songs.length > 0) {
            updatePlaylist(); // ✅ Update the playlist UI
            playMusic(songs[0]);
        } else {
            console.warn(`❌ No songs found in folder: ${folderPath}`);
        }
    });
});

}
async function main() {
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    // existing event listeners...

    displayAlbums(); // ✅ Add this line
}

// Attach an event listener to play, next and previous
Play.addEventListener("click", () => {
    if (currentSong.paused) {
        currentSong.play()
        Play.src = "images/pause.svg"
    } else {
        currentSong.pause()
        Play.src = "images/play.svg"
    }
})

// Listen for time update event
currentSong.addEventListener("timeupdate", () => {
    let currentTime = Math.floor(currentSong.currentTime)
    let duration = Math.floor(currentSong.duration)
    let currentTimeString = `${Math.floor(currentTime / 60)}:${currentTime % 60 < 10 ? "0" + currentTime % 60 : currentTime % 60}`
    let durationString = `${Math.floor(duration / 60)}:${duration % 60 < 10 ? "0" + duration % 60 : duration % 60}`
    document.querySelector(".songtime").innerHTML = `${currentTimeString} / ${durationString}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
})

// Add an event listener to seekbar
document.querySelector(".seekbar").addEventListener("click", (e) => {
    let seekBar = document.querySelector(".seekbar");
    let clickPosition = e.clientX - seekBar.getBoundingClientRect().left;
    let percentage = clickPosition / seekBar.offsetWidth;
    currentSong.currentTime = percentage * currentSong.duration;
    document.querySelector(".circle").style.left = percentage * 100 + "%";
});

// Add an event listener for hamburger menu
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
});

// Add an event listener for close button
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%"
});

// Add an event Listener for previous buttons
Previous.addEventListener("click", () => {
    console.log("Previous clicked")
    let Index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((Index - 1) >= 0) {
        playMusic(songs[Index - 1])
    }
})

// Add an event Listener for next buttons
next.addEventListener("click", () => {
    console.log("Next clicked")
    let Index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((Index + 1) < songs.length) {
        playMusic(songs[Index + 1])
    }
})

// Add an event listener for volume control
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("setting volume to", e.target, e.target.value );
    currentSong.volume = parseInt(e.target.value) / 100;
})
// Add event listener to mute the track

document.querySelector(".volume>img").addEventListener("click", e=> {
    if(e.target.src.includes("volume.svg")) {
        e.target.src = e.target.src.replace("volume.svg", "mute.svg");
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }else{
        e.target.src = e.target.src.replace("mute.svg", "volume.svg");
        currentSong.volume = .1;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
})




main()