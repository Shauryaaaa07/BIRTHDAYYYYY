# Teju's Birthday Experience - Media Assets Directory Guide

Welcome! This folder holds the placeholders for your visual and audio media. 
The website is programmed with an **Asset Fallback System**—meaning if files are missing, the website will automatically generate gorgeous interactive graphics and synthesized Web Audio melodies so you can test it immediately.

When you are ready, simply place your actual media files inside the respective folders matching the filenames and formats listed below.

---

## 1. Photos Folder (`/assets/photos/`)

Place **15 photos** here. They will be displayed in the cinematic Ken Burns parallax slideshow (Scene 7).

*   **Format**: JPG / JPEG (all lowercase extension `.jpg`)
*   **Filenames**:
    *   `photo1.jpg`
    *   `photo2.jpg`
    *   `photo3.jpg`
    *   ...
    *   `photo15.jpg`
*   **Tip**: Standard portrait/landscape high-resolution (e.g. 1080x1350 or 1920x1080) works best. The site utilizes CSS `object-fit: cover` to auto-adjust dimensions without squishing.

---

## 2. Videos Folder (`/assets/videos/`)

Place **4 videos** here. They will automatically play in their respective scenes.

*   **Format**: MP4 (H.264 video codec and AAC audio codec for high compatibility)
*   **Filenames**:
    *   `video1.mp4` (Plays in **Scene 6: Luxury Gift Box** after opening)
    *   `video2.mp4` (Plays in **Scene 8: Wish Tree** inside the magical portal)
    *   `video3.mp4` (Plays in **Ending: Special Memories** segment)
    *   `video4.mp4` (Plays in **Ending: Final Surprise** segment)
*   **Tip**: Keep file sizes optimized (compressed) to ensure fast cinematic loading on mobile connections. 16:9 widescreen layout works best.

---

## 3. Music Folder (`/assets/music/`)

Place **4 soundtracks** here. The site will execute logarithmic crossfades between them.

*   **Format**: MP3 (all lowercase extension `.mp3`)
*   **Filenames**:
    *   `song1.mp3` (Plays during **Countdown Lock** - recommended mood: mysterious, atmospheric)
    *   `song2.mp3` (Plays during **Scenes 1 to 6** - recommended mood: nature, magical, acoustic)
    *   `song3.mp3` (Plays during **Scene 7: Slideshow** - recommended mood: nostalgic, emotional piano)
    *   `song4.mp3` (Plays from **Scene 8 to End** - recommended mood: grand, orchestral, touching climax)

---

## Testing Local Assets

1.  Place your files in their folders.
2.  Open your console in the project root.
3.  Run `npm install` and then `npm run dev`.
4.  Open the local browser link. The website will read your files and automatically play them!
