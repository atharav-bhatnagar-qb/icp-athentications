import { useEffect, useState } from 'react';
import { ttearn_backend } from 'declarations/ttearn_backend';
import {AuthClient} from '@dfinity/auth-client'
import {NFID} from "@nfid/embed"
import { canisterId, createActor } from '../../declarations/ttearn_backend';
import { HttpAgent } from '@dfinity/agent';
import { PlugMobileProvider } from '@funded-labs/plug-mobile-sdk';
import MobileProvider from '@funded-labs/plug-mobile-sdk/dist/src/MobileProvider';
import { Principal } from '@dfinity/principal';
import { idlFactory } from '../../declarations/ttearn_backend/ttearn_backend.did.js';

function App() {
  const [greeting, setGreeting] = useState('');
  const [nfid,setNfid]=useState(null)
  const [actor,setActor]=useState(null)

  
  async function initNFID(){
    const n=await NFID.init({
      application:"test",
      logo:"https://dev.nfid.one/static/media/id.300eb72f3335b50f5653a7d6ad5467b3.svg"
    })
    setNfid(n)
  }
  useEffect(()=>{
    initNFID()
  },[])
  async function nfidConnect() {
    try{
      let delegationIdentity=await nfid.getDelegation({
        targets:[process.env.CANISTER_ID_TTEARN_BACKEND],
        // derivationOrigin:"https://wbbq2-uaaaa-aaaao-a3rba-cai.icp0.io/",
        maxTimeToLive: BigInt(8) * BigInt(3_600_000_000_000)
      })
      console.log("iden",delegationIdentity)
      let identity=await nfid.getIdentity()
      const agent = new HttpAgent({identity:delegationIdentity})
      const actor=createActor(process.env.CANISTER_ID_TTEARN_BACKEND,{agent:agent})
      setActor(actor)
      const res=await actor.whami()
      alert("hello ",res)
      setGreeting(res)
      console.log(res)
    }catch(err){
      console.log(err)
    }
  }

  async function authenticate(){
    try {
      const authclient=await AuthClient.create({})
      authclient.login({
        identityProvider:
          process.env.DFX_NETWORK === 'ic'
            ? 'https://identity.ic0.app'
            : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`,

        onSuccess: ()=>alert("authenticated"),
      });
      const agent = new HttpAgent({identity:authclient.getIdentity()})
      let actor=createActor(process.env.CANISTER_ID_TTEARN_BACKEND,{agent:agent})
      setActor(actor)

      const res=await actor.whami()
      console.log(res)
      setGreeting(res)
      alert("hello ",res)
    } catch (err) {
      console.log(err)
    }
    
  }

  async function plugConnectMobile(){
    try{
      const isMobile=PlugMobileProvider.isMobileBrowser()
      alert("ismobile")
      if(isMobile){
        alert("before initialize")
        const provider = new PlugMobileProvider({
          debug: true, 
          walletConnectProjectId: '143e95d92fffc4fe5b2355904907a616', 
          window: window,
        })
        await provider.initialize().catch((err)=>alert(`err in initialize : ${err}`))
        alert("initialize done")
        if (!provider.isPaired()) {
          alert("provider  ot paired")
          await provider.pair().catch(alert)
        }
        const agent = await provider.createAgent({
          host: 'https://icp0.io',
          targets: [process.env.CANISTER_ID_TTEARN_BACKEND],
        })
        alert("agent created")
        const actor=createActor(process.env.CANISTER_ID_TTEARN_BACKEND,{agent:agent})
        setActor(actor)

        const res=await actor.whami()
        console.log(res)
        setGreeting(res)
        alert("hello ",res)
      }else{
        alert("not a mobile device")
        const pubKey=await window.ic.plug.requestConnect({whitelist:[process.env.CANISTER_ID_TTEARN_BACKEND]})
        alert("plug desk connection complete")
        const actor=await window.ic.plug.createActor({
          canisterId:process.env.CANISTER_ID_TTEARN_BACKEND,
          interfaceFactory:idlFactory
        })
        alert("plug desk actor created")
        setActor(actor)

        const res=await actor.whami()
        console.log(res)
        setGreeting(res)
        alert("hello ",res)
      }
    }catch(err){
      alert(err)
    }
  }
  
  async function handleClick(){
    try {
      console.log("clicked")
      let res=await ttearn_backend.click()
      console.log("total clicks :",res)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <main>
      <form action="#" >
        <h1>Demo clicker</h1>
        <button onClick={authenticate}>Internet identity connectyes</button>
        <button onClick={nfidConnect}>NFID connect</button>
        <button onClick={plugConnectMobile}>PLug mobile</button>
        <div className="clicker" onClick={handleClick}>Click me</div>
      </form>
      <section id="greeting">{greeting}</section>
    </main>
  );
}

export default App;
