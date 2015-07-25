#JavaScript Java Parser
This project can currently parse a Java class file and store all of its data in a JavaScript object. Its functionality is equivalent to running `javap -v Main`, although it keeps everything in memory (no output). All the code is loaded into the object, but it cannot be run (it remains as Java bytecode).

## Notes
I coded the current version of this in a little over an hour. This version cannot do anything besides read the file. For a simple file, like the included `Main.class`, the results are fairly readable (from a JavaScript console).
