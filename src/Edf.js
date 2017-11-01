/*
* Author    Jonathan Lurie - http://me.jonahanlurie.fr
* License   MIT
* Link      https://github.com/jonathanlurie/edfdecoder
* Lab       MCIN - http://mcin.ca/ - Montreal Neurological Institute
*/


/**
*
* When the number of record is greater than one, it means that each signal have more than one record.
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
  * @param {Number} index of the signal
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
  * @param {Number} index of the signal
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
  * @param {Number} index of the signal
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
  * @param {Number} index of the signal
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
  * @param {Number} index of the signal
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
  * Get the number of samples for a given signal index
  * @param {Number} index of the signal
  * @return {Number}
  */
  getSignalNumberOfSamples( index ){
    if( index < 0 || index >= this._header.signalInfo.length ){
      console.warn("Signal index is out of range");
      return null;
    }

    return this._header.signalInfo[index].nbOfSamples
;
  }

} /* END of class Edf */

export { Edf };
