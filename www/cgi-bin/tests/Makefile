CC = g++
CFLAGS = -g

INCLUDES = -I. `pkg-config --cflags opencv`
LIBS = -L. -lhighgui

SRC = getICPercent

all: clean $(SRC)

getICPercent: $(SRC:=.cpp)
	$(CC) $(CFLAGS) $^ -o $@ $(INCLUDES) $(LIBS)
	chmod a+x $@

.PHONY: clean

clean:
	rm -f $(SRC) *.o