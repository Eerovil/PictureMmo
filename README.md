# PictureMmo


Login via Oauth to prevent most duplicates.
Each gets own color.
It's allowed to switch colors to an unused one.

If no progress made in 24 hours, character is killed

Everyone has a 15? line assembly-style process (like in zachtronics games)

Map is an image, start with 100x100px 

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