export default {
  addMIDIButtons (ev, generalMenu, layerMenu) {
    const midi = this.$menu.$folder.midi = this.$menu.addFolder({
      title: `MIDI Settings`,
      expanded: Layers.midiConnected
    })
    
    // Connect to MIDI
    if (!Layers.midiConnected) {
      midi.addBlade({
        view: 'buttongrid',
        size: [1, 1],
        cells: (x, y) => ({
          title: [
            ['🎹 Connect MIDI']
          ][y][x]
        }),
      }).on('click', () => {
        Layers.connectMIDI(ev, this)
      })

    // Disconnect from MIDI
    } else {
      let bindMidiMessage = 'Bind MIDI'
      if (Layers.isBindingMIDI) {
        if (Layers.curBindingControl) {
          bindMidiMessage = 'Click setting to bind'
        } else if (Layers.curBindingProp) {
          bindMidiMessage = 'Move MIDI control'
        } else {
          bindMidiMessage = 'Click setting'
        }
      }
      
      midi.addBlade({
        view: 'buttongrid',
        size: [2, 1],
        cells: (x, y) => ({
          title: [
            ['🔌 Disconnect MIDI', bindMidiMessage]
          ][y][x]
        }),
      }).on('click', (btnEv) => {
        if (btnEv.index[0] === 0) {
          Layers.disconnectMIDI(ev, this)
        } else {
          Layers.curBindingLayer = this
          Layers.startBindingMIDI(ev, this)
          this.showContextMenu(ev)
        }
      })
    }
  }
}