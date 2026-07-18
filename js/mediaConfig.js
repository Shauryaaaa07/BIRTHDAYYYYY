/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - MEDIA PATHS CONFIG (mediaConfig.js)
   ========================================================================== */

export const mediaConfig = {
    // 15 Photos for Memory Gallery (Scene 7)
    photos: Array.from({ length: 15 }, (_, i) => {
        const id = String(i + 1).padStart(2, '0');
        return {
            path: `./assets/photos/photo${id}.jpg`,
            caption: `Memory #${id}: A special moment shared.`
        };
    }),
    
    // 4 Cinematic Videos (with Canvas fallbacks if missing)
    videos: {
        video1: "./assets/videos/video01.mp4", // Scene 6: Gift Box reveal
        video2: "./assets/videos/video02.mp4", // Scene 10: Wish Tree Portal
        video3: "./assets/videos/video03.mp4", // Scene 12: Crystal Surprise
        video4: "./assets/videos/video04.mp4"  // Scene 13: Final Thank You
    },
    
    // 4 Cinematic BGMs (with audio synthesizers fallbacks if missing)
    songs: {
        track1: "./assets/music/bgm01.m4a", // Scene 0 & 1
        track2: "./assets/music/bgm02.m4a", // Scene 2, 2.5 & 3
        track3: "./assets/music/bgm03.mp3", // Scene 4, 5, 6 & 7
        track4: "./assets/music/bgm04.m4a"  // Scene 8 to 14 (Ending)
    }
};
