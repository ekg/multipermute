all: multipermute

multipermute: multipermute.cpp multipermute.h
	g++ multipermute.cpp -o multipermute

clean:
	rm multipermute
