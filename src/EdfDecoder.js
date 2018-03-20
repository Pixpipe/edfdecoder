/*
* Author    Jonathan Lurie - http://me.jonahanlurie.fr
* License   MIT
* Link      https://github.com/jonathanlurie/edfdecoder
* Lab       MCIN - http://mcin.ca/ - Montreal Neurological Institute
*/


import codecutils from 'codecutils';
import { Edf } from './Edf.js';


/**
* An instance of EdfDecoder is used to decode an EDF file, or rather a buffer extracted from a
* EDF file. To specify the input, use the method `.setInput(buf)` , then launch the decoding
* with the method `.decode()` and finally get the content as an object with `.getOutput()`.
* If the output is `null`, then the parser was not able to decode the file.
*/
class EdfDecoder {

  /**
   * Create a EdfDecoder.
   */
  constructor( ) {
    this._inputBuffer = null;
    this._output = null;
  }


  /**
  * Set the buffer (most likey from a file) that contains some EDF data
  * @param {ArrayBuffer} buff - buffer from a file
  */
  setInput( buff ){
    this._output = null;
    this._inputBuffer = buff;
  }


  /**
  * Decode the EDF file buffer set as input. This is done in two steps, first the header and then the data.
  */
  decode(){
    try{
      var headerInfo = this._decodeHeader();
      this._decodeData( headerInfo.offset, headerInfo.header );
    }catch(e){
      console.warn( e );
    }


  }


  /**
  * [PRIVATE]
  * Decodes the header or the file
  */
  _decodeHeader(){
    if(! this._inputBuffer ){
      console.warn("A input buffer must be specified.");
      return;
    }

    var header = {};
    var offset = 0;

    // 8 ascii : version of this data format (0)
    header.dataFormat = codecutils.CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim();
    offset += 8;

    // 80 ascii : local patient identification
    header.patientId = codecutils.CodecUtils.getString8FromBuffer( this._inputBuffer , 80, offset).trim();
    offset += 80;

    // 80 ascii : local recording identification
    header.localRecordingId = codecutils.CodecUtils.getString8FromBuffer( this._inputBuffer , 80, offset).trim();
    offset += 80;

    // 8 ascii : startdate of recording (dd.mm.yy)
    var recordingStartDate = codecutils.CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim();
    offset += 8;

    // 8 ascii : starttime of recording (hh.mm.ss)
    var recordingStartTime = codecutils.CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim();
    offset += 8;

    var date = recordingStartDate.split(".");
    var time = recordingStartTime.split(".");
    header.recordingDate = new Date( date[2], date[1], date[0], time[0], time[1], time[2], 0 );

    // 8 ascii : number of bytes in header record
    header.nbBytesHeaderRecord = parseInt( codecutils.CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim() );
    offset += 8;

    // 44 ascii : reserved
    header.reserved = codecutils.CodecUtils.getString8FromBuffer( this._inputBuffer , 44, offset);
    offset += 44;

    // 8 ascii : number of data records (-1 if unknown)
    header.nbDataRecords = parseInt( codecutils.CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim() );
    offset += 8;

    // 8 ascii : duration of a data record, in seconds
    header.durationDataRecordsSec = parseInt( codecutils.CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim() );
    offset += 8;

    // 4 ascii : number of signals (ns) in data record
    header.nbSignals = parseInt( codecutils.CodecUtils.getString8FromBuffer( this._inputBuffer , 4, offset).trim() );
    offset += 4;

    // the following fields occurs ns time in a row each
    var that = this;
    function getAllSections( sizeOfEachThing ){
      var allThings = [];
      for(var i=0; i<header.nbSignals; i++){
        allThings.push( codecutils.CodecUtils.getString8FromBuffer( that._inputBuffer , sizeOfEachThing, offset ).trim() );
        offset += sizeOfEachThing;
      }
      return allThings;
    }

    var signalInfoArrays = {
      // ns * 16 ascii : ns * label (e.g. EEG Fpz-Cz or Body temp)
      label: getAllSections( 16 ),
      // ns * 80 ascii : ns * transducer type (e.g. AgAgCl electrode)
      transducerType: getAllSections( 80 ),
      // ns * 8 ascii : ns * physical dimension (e.g. uV or degreeC)
      physicalDimension: getAllSections( 8 ),
      // ns * 8 ascii : ns * physical minimum (e.g. -500 or 34)
      physicalMinimum: getAllSections( 8 ),
      // ns * 8 ascii : ns * physical maximum (e.g. 500 or 40)
      physicalMaximum: getAllSections( 8 ),
      // ns * 8 ascii : ns * digital minimum (e.g. -2048)
      digitalMinimum: getAllSections( 8 ),
      // ns * 8 ascii : ns * digital maximum (e.g. 2047)
      digitalMaximum: getAllSections( 8 ),
      // ns * 80 ascii : ns * prefiltering (e.g. HP:0.1Hz LP:75Hz)
      prefiltering: getAllSections( 80 ),
      // ns * 8 ascii : ns * nr of samples in each data record
      nbOfSamples: getAllSections( 8 ),
      // ns * 32 ascii : ns * reserved
      reserved: getAllSections( 32 )
    }

    var signalInfo = [];
    header.signalInfo = signalInfo;
    for(var i=0; i<header.nbSignals; i++){
      signalInfo.push({
        label: signalInfoArrays.label[i],
        transducerType: signalInfoArrays.transducerType[i],
        physicalDimension: signalInfoArrays.physicalDimension[i],
        physicalMinimum: parseFloat( signalInfoArrays.physicalMinimum[i] ),
        physicalMaximum: parseFloat( signalInfoArrays.physicalMaximum[i] ),
        digitalMinimum: parseInt( signalInfoArrays.digitalMinimum[i] ),
        digitalMaximum: parseInt( signalInfoArrays.digitalMaximum[i] ),
        prefiltering: signalInfoArrays.prefiltering[i],
        nbOfSamples: parseInt( signalInfoArrays.nbOfSamples[i] ),
        reserved: signalInfoArrays.reserved[i],
      })
    }

    return {
      offset: offset,
      header: header
    }
  }


  /**
  * [PRIVATE]
  * Decodes the data. Must be called after the header is decoded.
  * @param {Number} byteOffset - byte size of the header
  */
  _decodeData( byteOffset, header ){
    if(! this._inputBuffer ){
      console.warn("A input buffer must be specified.");
      return;
    }

    if(! header ){
      console.warn("Invalid header");
      return;
    }

    var sampleType = Int16Array;

    // the raw signal is the digital signal
    var rawSignals = new Array(header.nbSignals);
    var physicalSignals = new Array(header.nbSignals);
    // allocation some room for all the records
    for(var ns=0; ns<header.nbSignals; ns++){
      rawSignals[ns] = new Array(header.nbDataRecords);
      physicalSignals[ns] = new Array(header.nbDataRecords);
    }

    // the signal are faster varying than the records
    for(var r=0; r<header.nbDataRecords; r++){
      for(var ns=0; ns<header.nbSignals; ns++){
        var signalNbSamples = header.signalInfo[ns].nbOfSamples;
        var rawSignal = codecutils.CodecUtils.extractTypedArray( this._inputBuffer, byteOffset, sampleType, signalNbSamples );
        byteOffset += signalNbSamples * sampleType.BYTES_PER_ELEMENT;
        rawSignals[ns][r] = rawSignal;


        // compute the scaled signal
        var physicalSignal = new Float32Array( rawSignal.length ).fill(0);
        var digitalSignalRange = header.signalInfo[ns].digitalMaximum - header.signalInfo[ns].digitalMinimum;
        var physicalSignalRange = header.signalInfo[ns].physicalMaximum - header.signalInfo[ns].physicalMinimum;


        for(var index=0; index<signalNbSamples; index++){
          physicalSignal[ index ] = (((rawSignal[index] - header.signalInfo[ns].digitalMinimum) / digitalSignalRange ) * physicalSignalRange) + header.signalInfo[ns].physicalMinimum;
        }

        //physicalSignals.push( physicalSignal );
        physicalSignals[ns][r] = physicalSignal;

      }
    }

    this._output = new Edf( header, rawSignals, physicalSignals );


  } /* END method */



  /**
  * Get the output as an object. The output contains the the header (Object),
  * the raw (digital) signal as a Int16Array and the physical (scaled) signal
  * as a Float32Array.
  * @return {Object} the output.
  */
  getOutput(){
    return this._output;
  }

}

export { EdfDecoder };
