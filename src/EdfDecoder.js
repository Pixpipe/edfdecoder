/*
* Author    Jonathan Lurie - http://me.jonahanlurie.fr
* License   MIT
* Link      https://github.com/jonathanlurie/edfdecoder
* Lab       MCIN - http://mcin.ca/ - Montreal Neurological Institute
*/

//import { Float16Array, getFloat16, setFloat16, hfround } from "@petamoriken/float16";
//import * as f16 from "@petamoriken/float16";
import Float16Array from "@petamoriken/float16";
import getFloat16 from "@petamoriken/float16";

import { CodecUtils } from 'codecutils';


/** Class representing a EdfDecoder. */
class EdfDecoder {

  /**
   * Create a EdfDecoder.
   */
  constructor( ) {
    this._inputBuffer = null;
    this._output = null;
  }

  setInput( buff ){
    this._output = {};
    this._inputBuffer = buff;
  }

  decode(){
    var offset = 0;
    try{
      offset = this._decodeHeader();
    }catch(e){
      console.warn( e );
      this._output = null;
    }

    if( offset ){
      try{
        //this._decodeData( offset );
        this._decodeDataFloat16( offset );
      }catch(e){
        console.warn( e );
        this._output = null;
      }
    }

  }

  _decodeHeader(){
    if(! this._inputBuffer ){
      console.warn("A input buffer must be specified.");
      return;
    }

    var header = {};
    this._output.header = header;

    var offset = 0;

    // 8 ascii : version of this data format (0)
    header.dataFormat = CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim();
    offset += 8;

    // 80 ascii : local patient identification
    header.patientId = CodecUtils.getString8FromBuffer( this._inputBuffer , 80, offset).trim();
    offset += 80;

    // 80 ascii : local recording identification
    header.localRecordingId = CodecUtils.getString8FromBuffer( this._inputBuffer , 80, offset).trim();
    offset += 80;

    // 8 ascii : startdate of recording (dd.mm.yy)
    header.recordingStartDate = CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim();
    offset += 8;

    // 8 ascii : starttime of recording (hh.mm.ss)
    header.recordingStartTime = CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim();
    offset += 8;

    // 8 ascii : number of bytes in header record
    header.nbBytesHeaderRecord = parseInt( CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim() );
    offset += 8;

    // 44 ascii : reserved
    header.reserved = CodecUtils.getString8FromBuffer( this._inputBuffer , 44, offset);
    offset += 44;

    // 8 ascii : number of data records (-1 if unknown)
    header.nbDataRecords = parseInt( CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim() );
    offset += 8;

    // 8 ascii : duration of a data record, in seconds
    header.durationDataRecordsSec = parseInt( CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim() );
    offset += 8;

    // 4 ascii : number of signals (ns) in data record
    header.nbSignals = parseInt( CodecUtils.getString8FromBuffer( this._inputBuffer , 4, offset).trim() );
    offset += 4;

    // the following fields occurs ns time in a row each
    var that = this;
    function getAllSections( sizeOfEachThing ){
      var allThings = [];
      for(var i=0; i<header.nbSignals; i++){
        allThings.push( CodecUtils.getString8FromBuffer( that._inputBuffer , sizeOfEachThing, offset ).trim() );
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

    return offset;
  }


  _decodeData( byteOffset ){
    if(! this._inputBuffer ){
      console.warn("A input buffer must be specified.");
      return;
    }

    if(! "header" in this._output ){
      console.warn("Invalid header");
      return;
    }


    var sampleType = Int16Array;
    var header = this._output.header;
    var signals = [];
    this._output.signals = signals;

    var signalOffset = 0;

    for(var i=0; i<header.nbSignals; i++){
      var signalNbSamples = header.signalInfo[i].nbOfSamples * header.nbDataRecords;
      var signal = CodecUtils.extractTypedArray( this._inputBuffer, byteOffset + signalOffset, sampleType, signalNbSamples );
      signalOffset += signalNbSamples * sampleType.BYTES_PER_ELEMENT;
      signals.push( signal );
    }

    console.log( this._output );
  }



  _decodeDataFloat16( byteOffset ){
    if(! this._inputBuffer ){
      console.warn("A input buffer must be specified.");
      return;
    }

    if(! "header" in this._output ){
      console.warn("Invalid header");
      return;
    }


    var bytePerSample = 2;
    var header = this._output.header;
    var signals = [];
    this._output.signals = signals;

    var signalOffset = 0;

    for(var i=0; i<header.nbSignals; i++){
      var signalNbSamples = header.signalInfo[i].nbOfSamples * header.nbDataRecords;

      var slicedBuff = this._inputBuffer.slice(byteOffset + signalOffset, byteOffset + signalOffset + signalNbSamples * bytePerSample);
      let view = new DataView( slicedBuff );
      var signal = [];

      for(var s=0; s<signalNbSamples; s++){
        signal.push( getFloat16.getFloat16(view, s * bytePerSample, false) );
      }


      //var signal = CodecUtils.extractTypedArray( this._inputBuffer, byteOffset + signalOffset, sampleType, signalNbSamples );
      signalOffset += signalNbSamples * bytePerSample;
      signals.push( signal );
    }

    console.log( this._output );
  }



}

export { EdfDecoder };
