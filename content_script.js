console.log('Content script is running')

const SERVICE_UUID = '0000ff02-0000-1000-8000-00805f9b34fb'
const CHARACTERISTIC_UUID = '0000fffc-0000-1000-8000-00805f9b34fb'

const connectDevice = async () => {
  var options = {
    filters: [{services: [SERVICE_UUID]}],
  }
  const device = await navigator.bluetooth.requestDevice(options);
  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(SERVICE_UUID);
  const characteristics = await service.getCharacteristics(CHARACTERISTIC_UUID);
  const characteristic = characteristics.find(char => char.uuid === CHARACTERISTIC_UUID);
  return characteristic;
}

const setColor = async (characteristic, red, green, blue, saturation) => {
  var bytes = new Uint8Array([red, green, blue, saturation])
  await characteristic.writeValue(bytes)
}

const blink = (characteristic) => {
  setColor(characteristic, 255, 255, 255, 255);
  new Promise(resolve => {
    setTimeout(async () => {
      setColor(characteristic, 0, 0, 0, 0);
      resolve()
    }, 200)
  })
  
}

let interval = null;
const button = document.createElement('button');
button.innerHTML = 'Bluetooth Connect'
button.style.zIndex = '10';
button.style.position = 'absolute';
button.onclick = async () => {
  const characteristic = await connectDevice();
  blink(characteristic);
  clearInterval(interval);
  interval = setInterval(() => {
    console.log('Document title is ', document.title)
    if (document.title.includes('Inbox (')) {
      blink(characteristic);
    }
  }, 2000)
}
document.body.appendChild(button);