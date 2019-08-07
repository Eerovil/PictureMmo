
class BaseParser(object):
    def split_args(self, line):
        # Remove comments
        line = line.split("#")[0].strip()
        _split = line.split(" ")
        cmd = _split[0]
        args = _split[1:]
        return [cmd, args]

    def parse_file(self, filename):
        parsed = []
        with open(filename, 'r') as f:
            for line in f.readlines():
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


if __name__ == "__main__":
    p = PmoToJAvascript()
    with open('jsout.js', 'w') as f:
        for line in p.parse_file('example.pmo'):
            f.write(line + "\n")
