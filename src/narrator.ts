import {Character, getGameWorld} from "./gameWorld.ts";
import {getGameLogic} from "./gameLogic.ts";

type Popup = {
    message: string;
    secsBeforeDisplayed: number;
    character: Character;
    onDone: () => void;
};

// Wrapper for brevity in messages[]
const m = (content: string, s: number, c: Character = Character.NARRATOR, onDone: () => void = () => {}): Popup =>
          ({ message: content, secsBeforeDisplayed: s, character: c, onDone: onDone });

export class Narrator {
    messages: Popup[] =
        [m("Yo dumbass, listen up.                            ", 2),
         // m("I'm here to give you some hot finance advice.       ", 0),
         // m("I know, it's a game jam, but pay attention and these might be the most profitable minutes of your life.                        I'm not kidding.                   ", 0),
         m("In this game, you will learn how to INVEST. Or rather, learn that investing is brain-dead simple.                   Charles, bring up the terminal.", 0, Character.NARRATOR, () => getGameLogic().showTerminal(true)),
            // < Spawn in terminal >
         m("Use this to buy and sell stocks.                  Have fun!", 3),

         m("Let me explain the stocks to you, since clearly you need it...", 30),
         m("Each of these is a random company's stock. With one exception, the World.", 0),
         m("The world tracks thousands of companies, and (just like real life) most consistently goes up.                                                           ", 0),
         m("If you don't want to gamble, that's the one to go for!                    ", 0),

         m("Oh and, you have 30 years.               ", 2),

         m("What has this to do with \"loop\" you ask?                                                                                                         ", 23),

         m("...", 3),

         m("To spice it up, let me introduce you to some competition!                       ", 20, Character.NARRATOR, () => getGameLogic().showBarChart()),
            // < Spawn in bar chart >
         m("First up is Rob the monkey! He randomly buys or sells random quantities of random stocks at random times. He's so random!                         ", 0),
         m("OOOOO OO OOOO  AAAAA AAA AAA                      ", 0, Character.MONKEY),
         m("And then we have my very own grandma.      So old she turned to stone centuries ago, yet her automatic transfer is still running!    ", 0),
         m("She does nothing but buy as much World as possible.      ", 0),
         m("The flowers wither when none remain to weep for them — and still, the earth turns.                           ", 0, Character.GRANNY),
         m("They each had the same starting amount     and earn as much side income as you. See if you can beat them!                     ", 0),

         m("OOO AAA AAA OOO                               * Rob is licking a rock. *", 25, Character.MONKEY),

         m("In case I wasn't clear before: you can win by just investing in World. No need to be smart. It's almost cheating.                     ", 25),

         m("To endure is to defy the vanity of ease.            ", 25, Character.GRANNY),

         m("Not much longer to go before retirement, make those years count!", 25)
        ];

    endMessages: Popup[] = [
        m("Time's up! Let's see how you did.                                                                                                    ", 0, Character.NARRATOR, () => getGameLogic().showEndSlide(1)),
        m("This is how much you earned with your job.                              In other words, what you would have had without investing.                                                                  ", 0),
        m("But you turned it into...                      ", 0, Character.NARRATOR, () => getGameLogic().showEndSlide(2)),
        m("This!                                      Whether it is an impressive result I cannot say, because these are pre-programmed messages.                                                              ", 0),
        m("Now, let's have a look at your competition...                                ", 2, Character.NARRATOR, () => getGameLogic().showEndSlide(3)),
        m("OO AA AA OO!!                                                                   ", 0, Character.MONKEY),
        m("Shocking results!!!                           It is clear that the slow-and-steady method is superior.                                    ", 0),
        m("That's all I wanted to teach you, now go out there and invest!                  Thanks for playing!                                                                 ", 2, Character.NARRATOR, () => getGameLogic().showEndSlide(4)),
        m("Dude, just go", 10),
        m("If you're staying here this long, might as well give us a rating on the jam!", 10)
    ];

    messageIndex = -1;
    lastMessageDone = false;
    secondsUntilNextMessage: number = this.messages[0].secsBeforeDisplayed;

    update(delta: number) {
        this.countToNextMessage(delta);
    }

    private countToNextMessage(delta: number) {
        if (this.lastMessageDone) this.secondsUntilNextMessage -= delta;

        if (this.secondsUntilNextMessage < 0) {
            this.messageIndex++
            if (this.messageIndex >= this.messages.length - 1) this.secondsUntilNextMessage = 999999
            else this.secondsUntilNextMessage = this.messages[this.messageIndex + 1].secsBeforeDisplayed

            let message = this.messages[this.messageIndex]

            this.lastMessageDone = false;
            getGameWorld().showText(message.message, {
                fadeout: this.secondsUntilNextMessage != 0, // Fadeout if the next message is not instantaneous after
                character: message.character,
                onDone: () => {this.lastMessageDone = true; message.onDone()}
            })

            console.log("triggered message " + this.messageIndex + ", now waiting " + this.secondsUntilNextMessage + "s")
        }
    }

    startEndSpeech() {
        this.lastMessageDone = true;
        this.messages = this.endMessages;
        this.messageIndex = -1;
        this.secondsUntilNextMessage = this.messages[0].secsBeforeDisplayed;
    }

    startYapping() {
        this.lastMessageDone = true;
    }
}
