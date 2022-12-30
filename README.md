# Indian Poker
As of now, this "non-mobile" version of the game is not formatted well with mobile devices. Supports different rooms. 
Written in Node.JS with Express and Socket.io. Cards assets taken from https://github.com/richardschneider/cardsJS.

Currently hosted at http://indian-poker.tk/.

### The Rules

###### Objective

In this game, you can see everyone else's cards but you cannot see your own. The object of the game is to guess your own card's ranking and value.  

Your **ranking** is how high your card is compared to others, with Ace being the highest and 2 being the lowest. For example, in a group of four, if you are the highest card, your ranking is first, or if you are the lowest card, you are fourth. Ties are explained further below.  

Your **value** is the number or face on the card. There are 13 unique values, as suit does not matter in this game.  

So how do you guess your ranking and value when you cannot see your own card? This game is all about gaining **information** from others. At first, someone starts by taking a guess at their own rank, and then in a clockwise direction, everyone else does the same. After everyone has gone, everyone goes around once more, and this time, each player is to guess their own ranking and value.  

Based on others' guesses, you may be able to get an idea of what your card may be. This is a collaborative game. If everyone gets their guesses completely correct, everyone wins.

###### Pairs, Triplets, Two Pairs, and More

One additional aspect of this game is that before anyone guesses, players are allowed to reveal if they see any tied values on the cards of other players, without specifying which players have tied values. Any player may call out what they see, but they can only share one piece of information. In addition, once a certain piece of information has been stated, another player cannot say the same thing.  

Furthermore, information **must** be said in a certain order, which is as follows: one pair, one triplet, one quad, two pair, two triplet, two quads, etc. For example, someone may not say they see two pairs before someone else in the group claims they see one pair.  

If there are ties, the ranking of the players with identical values are also identical, meaning there will be **less ranks in total**. For example, if two people have Aces, they are both first, and the next highest card would be second place (as opposed to third).  

**The last person to say something regarding this type of information starts the game.** If no one says anything, any person can start.

### Basic Strategies

###### Your Initial Guess

Do you see many high cards (e.g. Aces, Kings, Queens)? Perhaps the guess of your rank should be on the lower end. Conversely, do you see many low cards (e.g. 2's, 3's, 4's)? Then your guess of your rank may be on the higher end. Or maybe you see a large gap between cards, where some players have very low cards and others have very high cards. Then, you may likely want to guess that your rank is somewhere in the middle of these.

###### Using Others' Guesses

Ask yourself why others might guess the way they did. Perhaps you only see low cards, and the person next to you guesses that they are in second place. This may hint at the fact that your card may actually be on the higher end, for if your card were as low as everyone else's, the other guesser may have said that they were in first. Use this information from all the other guessers to try to place yourself somewhere on the spectrum on rankings.

###### But You Don't See a Pair?

Someone in your group has called out they see a pair, meaning that two people have the same valued cards. But, what if you don't see a pair? That means **you are part of the pair**. Try your best to find out who your pair may be. It could be anyone else in the circle, except, of course, the person that claimed they see the pair.