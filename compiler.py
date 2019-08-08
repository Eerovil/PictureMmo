import sqlite3
conn = sqlite3.connect('database.db')


class BaseParser(object):
    def split_args(self, line):
        # Remove comments
        line = line.split("#")[0].strip()
        _split = line.split(" ")
        cmd = _split[0]
        args = _split[1:]
        for i in range(len(args)):
            if args[i] != "REG":
                args[i] = int(args[i])
        return [cmd, args]

    def parse_file(self, filename):
        parsed = []
        with open(filename, 'r') as f:
            for line in f.readlines():
                parsed.append(self.parse_line(line))
        return parsed

    def parse_text(self, text):
        parsed = []
        for line in text.split("\n"):
            parsed.append(self.parse_line(line))
        return parsed


class PmoToJAvascript(BaseParser):
    def parse_line(self, line):
        cmd, args = self.split_args(line)
        for i in range(len(args)):
            if args[i] == "REG":
                args[i] = "getReg()"

        if cmd == "MOV":
            return "movePlayer(i, %s, %s)" % (args[0], args[1])
        elif cmd == "DRW":
            return "idata = drawPlayer(i, idata)"
        elif cmd == "ADD":
            return "addReg(%s)" % args[0]
        elif cmd == "SUB":
            return "subReg(%s)" % args[0]
        elif cmd == "SWP":
            return "swapReg()"
        elif cmd == "COL":
            return "checkColor(i, idata)"
        elif cmd == "IF":
            return 'if (getReg() == %s) {' % args[0]
        elif cmd == "ELS":
            return '} else {'
        elif cmd == "FI":
            return '}'
        elif cmd == "AND":
            return 'setReg(getReg() & %s)' % args[0]
        elif cmd == "OR":
            return 'setReg(getReg() | %s)' % args[0]
        else:
            print("UNKNOWN", cmd, args)
            return ""


class PmoToPython(BaseParser):
    def __init__(self, *args, **kwargs):
        self.indent = ""

    def parse_line(self, line):
        cmd, args = self.split_args(line)
        for i in range(len(args)):
            if args[i] == "REG":
                args[i] = "self.getReg()"
        if cmd == "MOV":
            return self.indent + "self.movePlayer(i, %s, %s)" % (args[0], args[1])
        elif cmd == "DRW":
            return self.indent + "self.drawPlayer(i)"
        elif cmd == "ADD":
            return self.indent + "self.addReg(%s)" % args[0]
        elif cmd == "SUB":
            return self.indent + "self.subReg(%s)" % args[0]
        elif cmd == "SWP":
            return self.indent + "self.swapReg()"
        elif cmd == "COL":
            return self.indent + "self.checkColor(i)"
        elif cmd == "IF":
            ret = self.indent + 'if self.getReg() == %s:' % args[0]
            self.indent += "    "
            return ret
        elif cmd == "ELS":
            return self.indent[:-4] + 'else:'
        elif cmd == "FI":
            self.indent = self.indent[:-4]
            return self.indent
        elif cmd == "AND":
            return self.indent + 'self.setReg(self.getReg() & %s)' % args[0]
        elif cmd == "OR":
            return self.indent + 'self.setReg(self.getReg() | %s)' % args[0]
        else:
            print("UNKNOWN", cmd, args)
            return self.indent + ""


if __name__ == "__main__":
    p = PmoToJAvascript()
    with open('jsout.js', 'w') as f:
        for line in p.parse_file('example.pmo'):
            f.write(line + "\n")

    p = PmoToPython()
    pythoncode = p.parse_file('example.pmo')
    with open('pyout.py', 'w') as f:
        for line in pythoncode:
            f.write(line + "\n")

