class Edf {
  constructor( header, rawSignals, physicalSignals ){
    this._header = header;
    this._physicalSignals = physicalSignals;
    this._rawSignals = rawSignals;
  }


  getRecordDuration(){

  }

} /* END of class Edf */

export { Edf };
