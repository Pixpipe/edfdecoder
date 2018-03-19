```
npm install --save edfdecoder
```


This project is a EDF file decoder in Javascript, for browser and NodeJS. Due to the lack of standard format in the world of electroencephalogram (EEG), EDF progressively took that seat, even though it is limited and far from perfect. Thanks to its simple specification, the EDF format is also used in many other bio-medical fields, not only EEG.  

It is important to mention that two format are labeled EDF:
- The regular EDF format ([link](https://www.edfplus.info/specs/edf.html))
- The extended EDF+ ([link](https://www.edfplus.info/specs/edfplus.html))

**This parser is NOT compatible with EDF+.**

[[DOCUMENTATION](http://pixpipe.github.io/edfdecoder/doc)]  
[[DEMO READING](http://pixpipe.github.io/edfdecoder/examples/browser.html)] 
[[DEMO PLOTTING](http://pixpipe.github.io/edfdecoder/examples/plot.html)] 

# Get started
To run the `EdfDecoder` you need a **.edf** file. Then, you have to run a procedure to get the file content as an `ArrayBuffer`. If you need some help on that, you can see the file `examples/browser.html`.

Then, create an instance of `EdfDecoder` and feed it with the buffer from the file:
```javascript
// say you have a buffer from an edf file named fileBuffer

var decoder = new edfdecoder.EdfDecoder();
decoder.setInput( buff );
decoder.decode();
var myEdf = decoder.getOutput();
```

The `EdfDecoder.getOutput()` method returns an instance of `Edf` ([link to doc](http://pixpipe.github.io/edfdecoder/doc#Edf)).  
This `Edf` object contains all the data from the *edf* file plus some helper function to query all these data.

# Use an Edf object
The header of *edf* file contains metadata that are accessible using helper functions in *edfdecoder*, you can see the list of methods [here](http://pixpipe.github.io/edfdecoder/doc#Edf).  

```javascript
// Get the number of signals, usually it is equivalent to the number of sensors
var numberOfSignals = myEdf.getNumberOfSignals();

// get the number of record
// note that each signal can have multiple records. A classic case is to have 1-second-long records
var numberOfRecords = myEdf.getNumberOfRecords();

// Get the signal, but you need to specify which signal and the index of the record
var signalIndex = 0;
var recordIndex = 0;
var aSignal = myEdf.getPhysicalSignal( signalIndex, recordIndex );

// It can be convenient to concatenate records from a same signal
// for example to get a signal that is longer than 1sec
var firstRecord = 8;
var numberOfRecords = 15;
var aLongerSignal = myEdf.getPhysicalSignalConcatRecords( signalIndex, firstRecord, numberOfRecords );

```
