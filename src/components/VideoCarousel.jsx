/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react"
import { hightlightsSlides } from "../constants"
import gsap from "gsap"
import { pauseImg, playImg, replayImg } from "../utils"
import { useGSAP } from "@gsap/react"

const VideoCarousel = () => {

    const videoRef = useRef([])
    const videoSpanRef = useRef([])
    const videoDivRef = useRef([])

    const [video, setVideo] = useState({
        isEnd: false,
        startPlay: false,
        videoId: 0,
        isLastVideo: false,
        isPlaying: false
    })

    const [loadedData, setLoadedData] = useState([])
    const { isEnd, startPlay, videoId, isLastVideo, isPlaying } = video

    useGSAP(() => {

        gsap.to("#slider", {
            transform: `translateX(${-100 * videoId}%)`,
            duration: 2,
            ease: "power2.inOut"
        })

        gsap.to("#video", {
            scrollTrigger: {
                trigger: "#video",
                toggleActions: "restart none none none"
            },

            onComplete: () => {
                setVideo((pre) => ({
                    ...pre,
                    startPlay: true,
                    isPlaying: true,
                }))
            }
        })
    }, [isEnd, videoId])

    useEffect(() => {
        if (loadedData.length > 3) {
            if (!isPlaying) {
                videoRef.current[videoId].pause()
            } else {
                startPlay && videoRef.current[videoId].play()
            }
        }
    }, [startPlay, videoId, isPlaying, loadedData])

    const handleLoadedMetadata = (i, e) => setLoadedData((pre) => [...pre, e])

    useEffect(() => {
        let currentProgress = 0;
        let span = videoSpanRef.current;

        if (span[videoId]) {
            // animation to move the indicator
            let anim = gsap.to(span[videoId], {
                onUpdate: () => {
                    // get the progress of the video
                    const progress = Math.ceil(anim.progress() * 100);

                    if (progress != currentProgress) {
                        currentProgress = progress;

                        // set the width of the progress bar
                        gsap.to(videoDivRef.current[videoId], {
                            width:
                                window.innerWidth < 760
                                    ? "10vw" // mobile
                                    : window.innerWidth < 1200
                                        ? "10vw" // tablet
                                        : "4vw", // laptop
                        });

                        // set the background color of the progress bar
                        gsap.to(span[videoId], {
                            width: `${currentProgress}%`,
                            backgroundColor: "white",
                        });
                    }
                },

                // when the video is ended, replace the progress bar with the indicator and change the background color
                onComplete: () => {
                    if (isPlaying) {
                        gsap.to(videoDivRef.current[videoId], {
                            width: "12px",
                        });
                        gsap.to(span[videoId], {
                            backgroundColor: "#afafaf",
                        });
                    }
                },
            });

            if (videoId == 0) {
                anim.restart();
            }

            // update the progress bar
            const animUpdate = () => {
                anim.progress(
                    videoRef.current[videoId].currentTime /
                    hightlightsSlides[videoId].videoDuration
                );
            };

            if (isPlaying) {
                // ticker to update the progress bar
                gsap.ticker.add(animUpdate);
            } else {
                // remove the ticker when the video is paused (progress bar is stopped)
                gsap.ticker.remove(animUpdate);
            }
        }
    }, [videoId, startPlay]);


    const handleProcess = (type, index) => {
        switch (type) {
            case "video-end":
                setVideo((pre) => ({ ...pre, isEnd: true, videoId: index + 1 }))
                break

            case "video-last":
                setVideo((pre) => ({ ...pre, isLastVideo: true }))
                break

            case "video-reset":
                setVideo((pre) => ({ ...pre, isLastVideo: false, videoId: 0 }))
                break

            case "play":
                setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }))
                break

            case "pause":
                setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }))
                break

            default:
                return video

        }
    }

    return (
        <>
            <div className="flex items-center">
                {hightlightsSlides.map((item, index) => (
                    <div key={index} id="slider" className="sm:pr-20 pr-10">
                        <div className="video-carousel_container relative">
                            <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                                <video
                                    id="video"
                                    playsInline={true}
                                    preload="auto"
                                    muted={true}
                                    ref={(el) => (videoRef.current[index] = el)}
                                    onPlay={() => {
                                        setVideo((pre => ({
                                            ...pre, isPlaying: true
                                        })))
                                    }}
                                    className={`${ item.id === 2 && 'translate-x-44' } pointer-events-none`}
                                    onEnded={() => {
                                        index !== 3
                                            ? handleProcess("video-end", index)
                                            : handleProcess("video-last")
                                    }}
                                    onLoadedMetadata={(e) => handleLoadedMetadata(index, e)}
                                >
                                    <source src={item.video} type="video/mp4" />
                                </video>
                            </div>
                            <div className="absolute top-12 left-[5%] z-10 w-full h-full">
                                {item.textLists.map((item) => (
                                    <p key={item} className="md:text-2xl text-xl font-medium">
                                        {item}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative flex-center mt-10">
                <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
                    {videoRef.current.map((_, index) => (
                        <span
                            className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
                            key={index}
                            ref={(el) => (videoDivRef.current[index] = el)}>
                            <span
                                className="absolute h-full w-full rounded-full"
                                ref={(el) => (videoSpanRef.current[index] = el)}
                            />

                        </span>
                    ))}
                </div>

                <button className="control-btn">
                    <img
                        src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
                        alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}

                        onClick={
                            isLastVideo ? () => handleProcess("video-reset") : !isPlaying ? () => handleProcess("play") : () => handleProcess("pause")} />
                </button>
                
            </div>
        </>
    )
}

export default VideoCarousel