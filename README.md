# PictureMmo


Login via Oauth to prevent most duplicates.
Each gets own color.
It's allowed to switch colors to an unused one.

If no progress made in 24 hours, character is killed

Everyone has a 15? line assembly-style process (like in zachtronics games)

Map is an image, start with 100x100px 


Server:
  Serve static index.html + latest (With apache? its cached)
  Clients can POST their new account/new code/new color etc. Listening is flask

  Every 1(?) minutes there is an update, and all clients are updated to have the most recent code.
  This is done via a sync value in each response, saying "35 seconds till update". The client will
  Then be like "ok, lets ask for new data in 35 seconds".

  Asking for new data just means loading the cdn data again. In 30 seconds the new data is "applied".
  i.e. There is 30 seconds time to "submit" and then 30 seconds time for the code to reach all players.

  When a client connects, they get a dump of data from the cdn, containing:
    The index.html
    index.js (with all code + user data)
  Then, they must simulate the game forwards since the cdn data is stale (up to 1min).
    PROBLEM! Since the data will be overwritten after 30 seconds, the new client will have to wait up to 30sec
    for the game to "start". Perhaps a "getting up to speed" message and running the game (with future data) at half speed for 30sec.

language:
  MOV
  JMP
  IF
  ELS
  FI
  COL
  DRW
  ADD
  SUB
  SWP
  AND
  OR
  NOT
  XOR



Example program zigzag:
1   MOV REG 1       # Zig, Move to dir REG (Using REG % 4)
2   DRW             # draw
3   ADD 1
4   MOV REG 1       # Zag
5   SWP             # Store direction
6   COL             # set REG to current color (0=my, 1=enemy, 2=empty)
7   IF 0 11         # If color is mine, jump to 11 
8   Add 1           # Change direction (Zag is the new Zig)
8   SWP             # Get direction
9   ADD 3           # Continue with Zig
10  JMP 1           # Loop
11  SWP             # Get direction
13 