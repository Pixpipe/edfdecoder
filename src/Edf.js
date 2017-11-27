 /*
* Author    Jonathan Lurie - http://me.jonahanlurie.fr
* License   MIT
* Link      https://github.com/jonathanlurie/edfdecoder
* Lab       MCIN - http://mcin.ca/ - Montreal Neurological Institute
*/


/**
* An instance of Edf is usually given as output of an EdfDecoder. It provides an
* interface with a lot of helper function to query information that were extracted
* from en *.edf* file, such as header information, getting a signal at a given record
* or concatenating records of a given signal.
*
* Keep in mind that the number of records in an edf file can be decoded by arbitrary
* measures, or it can be 1 second per records, etc.
*
*/
class Edf {
  constructor( header, rawSignals, physicalSignals ){
    this._header = header;
    this._physicalSignals = physicalSignals;
    this._rawSignals = rawSignals;
  }

  /**
  * Get the duration in second of a single record
  * @return {Number} duration
  */
  getRecordDuration(){
    return this._header.durationDataRecordsSec;
  }


  /**
  * Get the ID of the recording
  * @return {String} the ID
  */
  getRecordingID(){
    return this._header.localRecordingId;
  }


  /**
  * get the number of records per signal.
  * Note: most of the time, records from the same signal are contiguous in time.
  * @return {Number} the number of records
  */
  getNumberOfRecords(){
    return this._header.nbDataRecords;
  }


  /**
  * get the number of signals.
  * Note: a signal can have more than one record
  * @return {Number} the number of signals
  */
  getNumberOfSignals(){
    return this._header.nbSignals;
  }


  /**
  * Get the patien ID
  * @return {String} ID
  */
  getPatientID(){
    return this._header.patientId;
  }


  /**
  * Get the date and the time at which the recording has started
  * @return {Date} the date
  */
  getRecordingStartDate(){
    return this._header.recordingDate;
  }


  /**
  * Get the value of the reserved field, global (from header) or specific to a signal.
  * Notice: reserved are rarely used.
  * @param {Number} index - if not specified, get the header's reserved field. If [0, nbSignals[ get the reserved field specific for the given signal
  * @return {String} the data of the reserved field.
  */
  getReservedField( index=-1 ){
    if( index === -1 ){
      return this._header.reserved;
    }else{
      if( index >= 0 && index < this._header.signalInfo.length ){
        return this._header.signalInfo[index].reserved;
      }
    }

    return null;
  }


  /**
  * Get the digital maximum for a given signal index
  * @param {Number} index - index of the signal
  * @return {Number}
  */
  getSignalDigitalMax( index ){
    if( index < 0 || index >= this._header.signalInfo.length ){
      console.warn("Signal index is out of range");
      return null;
    }

    return this._header.signalInfo[index].digitalMaximum;
  }


  /**
  * Get the digital minimum for a given signal index
  * @param {Number} index - index of the signal
  * @return {Number}
  */
  getSignalDigitalMin( index ){
    if( index < 0 || index >= this._header.signalInfo.length ){
      console.warn("Signal index is out of range");
      return null;
    }

    return this._header.signalInfo[index].digitalMinimum;
  }


  /**
  * Get the physical minimum for a given signal index
  * @param {Number} index - index of the signal
  * @return {Number}
  */
  getSignalPhysicalMin( index ){
    if( index < 0 || index >= this._header.signalInfo.length ){
      console.warn("Signal index is out of range");
      return null;
    }

    return this._header.signalInfo[index].physicalMinimum;
  }


  /**
  * Get the physical maximum for a given signal index
  * @param {Number} index - index of the signal
  * @return {Number}
  */
  getSignalPhysicalMax( index ){
    if( index < 0 || index >= this._header.signalInfo.length ){
      console.warn("Signal index is out of range");
      return null;
    }

    return this._header.signalInfo[index].physicalMaximum;
  }


  /**
  * Get the label for a given signal index
  * @param {Number} index - index of the signal
  * @return {String}
  */
  getSignalLabel( index ){
    if( index < 0 || index >= this._header.signalInfo.length ){
      console.warn("Signal index is out of range");
      return null;
    }

    return this._header.signalInfo[index].label;
  }


  /**
  * Get the number of samples per record for a given signal index
  * @param {Number} index - index of the signal
  * @return {Number}
  */
  getSignalNumberOfSamplesPerRecord( index ){
    if( index < 0 || index >= this._header.signalInfo.length ){
      console.warn("Signal index is out of range");
      return null;
    }

    return this._header.signalInfo[index].nbOfSamples;
  }


  /**
  * Get the unit (dimension label) used for a given signal index.
  * E.g. this can be 'uV' when the signal is an EEG
  * @param {Number} index - index of the signal
  * @return {String} the unit name
  */
  getSignalPhysicalUnit( index ){
    if( index < 0 || index >= this._header.signalInfo.length ){
      console.warn("Signal index is out of range");
      return null;
    }

    return this._header.signalInfo[index].physicalDimension;
  }


  /**
  * Get the unit prefiltering info for a given signal index.
  * @param {Number} index - index of the signal
  * @return {String} the prefiltering info
  */
  getSignalPrefiltering( index ){
    if( index < 0 || index >= this._header.signalInfo.length ){
      console.warn("Signal index is out of range");
      return null;
    }

    return this._header.signalInfo[index].prefiltering;
  }


  /**
  * Get the transducer type info for a given signal index.
  * @param {Number} index - index of the signal
  * @return {String} the transducer type info
  */
  getSignalTransducerType( index ){
    if( index < 0 || index >= this._header.signalInfo.length ){
      console.warn("Signal index is out of range");
      return null;
    }

    return this._header.signalInfo[index].transducerType;
  }


  /**
  * Get the sampling frequency in Hz of a given signal
  * @param {Number} index - index of the signal
  * @return {Number} frequency in Hz
  */
  getSignalSamplingFrequency( index ){
    if( index < 0 || index >= this._header.signalInfo.length ){
      console.warn("Signal index is out of range");
      return null;
    }

    return this._header.signalInfo[index].nbOfSamples / this._header.durationDataRecordsSec;
  }

  /**
  * Get the physical (scaled) signal at a given index and record
  * @param {Number} index - index of the signal
  * @param {Number} record - index of the record
  * @return {Float32Array} the physical signal in Float32
  */
  getPhysicalSignal( index, record ){
    if( index < 0 || index >= this._header.signalInfo.length ){
      console.warn("Signal index is out of range");
      return null;
    }

    if( record<0 && record>=this._physicalSignals[index].length ){
      console.warn("Record index is out of range");
      return null;
    }

    return this._physicalSignals[index][record];
  }


  /**
  * Get the raw (digital) signal at a given index and record
  * @param {Number} index - index of the signal
  * @param {Number} record - index of the record
  * @return {Int16Array} the physical signal in Int16
  */
  getRawSignal( index, record ){
    if( index < 0 || index >= this._header.signalInfo.length ){
      console.warn("Signal index is out of range");
      return null;
    }

    if( record<0 && record>=this._rawSignals[index].length ){
      console.warn("Record index is out of range");
      return null;
    }

    return this._rawSignals[index][record];
  }



  /**
  * Get concatenated contiguous records of a given signal, the index of the
  * first record and the number of records to concat.
  * Notice: this allocates a new buffer of an extented size.
  * @param {Number} index - index of the signal
  * @param {Number} recordStart - index of the record to start with
  * @param {Number} howMany - Number of records to concatenate
  * @return {Float32Array} the physical signal in Float32
  */
  getPhysicalSignalConcatRecords(index, recordStart=-1, howMany=-1){
    if( index < 0 || index >= this._header.signalInfo.length ){
      console.warn("Signal index is out of range");
      return null;
    }

    if( recordStart<0 && recordStart>=this._physicalSignals[index].length ){
      console.warn("The index recordStart is out of range");
      return null;
    }

    if(recordStart === -1){
      recordStart = 0;
    }

    if(howMany === -1){
      howMany = this._physicalSignals[index].length - recordStart;
    }else{
      // we still want to check if what the user put is not out of bound
      if( recordStart + howMany > this._physicalSignals[index].length ){
        console.warn("The number of requested records is too large. Forcing only to available records.");
        howMany = this._physicalSignals[index].length - recordStart; 
      }

    }

    // index of the last one to consider
    var recordEnd = recordStart + howMany - 1;

    if( recordEnd<0 && recordEnd>=this._physicalSignals[index].length ){
      console.warn("Too many records to concatenate, this goes out of range.");
      return null;
    }

    var totalSize = 0;
    for(var i=recordStart; i<recordStart + howMany; i++){
      totalSize += this._physicalSignals[index][i].length;
    }

    var concatSignal = new Float32Array( totalSize );
    var offset = 0;

    for(var i=recordStart; i<recordStart + howMany; i++){
      concatSignal.set( this._physicalSignals[index][i], offset );
      offset += this._physicalSignals[index][i].length;
    }

    return concatSignal;
  }


} /* END of class Edf */

export { Edf };
