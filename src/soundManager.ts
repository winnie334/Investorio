import apple from "./assets/sounds/apple.mp3"
import background from "./assets/sounds/background.mp3"
import click from "./assets/sounds/click.mp3"
import error from "./assets/sounds/error.mp3"
import fish from "./assets/sounds/fish.mp3"
import granny from "./assets/sounds/granny_laugh.mp3"
import monkey1 from "./assets/sounds/monkey1.mp3"
import monkey2 from "./assets/sounds/monkey2.mp3"
import moon from "./assets/sounds/moon.mp3"
import potato from "./assets/sounds/potato.mp3"
import salary from "./assets/sounds/salary.mp3"
import select from "./assets/sounds/select.mp3"
import sell from "./assets/sounds/sell.mp3"

export const Sound = {
    APPLE: apple,
    BACKGROUND: background,
    CLICK: click,
    ERROR: error,
    FISH: fish,
    GRANNY: granny,
    MONKEY1: monkey1,
    MONKEY2: monkey2,
    MOON: moon,
    POTATO: potato,
    SALARY: salary,
    SELECT: select,
    SELL: sell,
} as const;

export type SoundKey = keyof typeof Sound;


export function playSound(sound: SoundKey, volume: number = 1.0) {
    const audio = new Audio(Sound[sound]);
    audio.volume = Math.min(Math.max(volume, 0), 1);
    audio.play();
}

