import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import SocialDApp from '../abis/SocialDApp.json'
import Navbar from './Navbar';
import Main from './Main';


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    //loading accounts
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    //Network Id
    const networkId = await web3.eth.net.getId()
    
    const networkData = SocialDApp.networks[networkId]
    
    if (networkData) {
      //creating instance of smart contract detected at ganache network
      const social = web3.eth.Contract(SocialDApp.abi, networkData.address)
      console.log(social)
      this.setState({ social })
      const postCount = await social.methods.postCount().call() //call functions dont use gass but send does as it update on blockchain
      this.setState({ postCount })
      //Loading posts as now we know their number
      for (var i = 1; i <= postCount; i++) {
        const post = await social.methods.posts(i).call()
        this.setState({
          posts: [...this.state.posts, post]
        })
      }
      //sorting the posts
      this.setState({
        posts:this.state.posts.sort((a,b)=>b.tipAmount - a.tipAmount)
      })
      this.setState({ loading:false})
    } else {
      window.alert('SocialDApp contract not deployed to detected network')
    }
  }

  createPost(content){
    this.setState({ loading: true })
    this.state.social.methods.createPost(content).send({from:this.state.account})
    .once('receipt',(receipt)=>{
        this.setState({ loading: false })
    })
   
  }

  tipPost(id, tipAmount) {
    this.setState({ loading: true })
    this.state.social.methods.tipPost(id).send({ from: this.state.account, value: tipAmount })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  constructor(props)   //React state which belongs to a component
  {//props are properties for components
    super(props)
    this.state = {
      account: '',
      social: null,
      postCount: 0,
      posts: [],
      loading:true
    }
    this.createPost=this.createPost.bind(this)
    this.tipPost = this.tipPost.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        {this.state.loading
         ? <div id='loader' className='text-center mt-5'><p>Loading...</p></div>
         :  <Main 
            posts={this.state.posts} 
            createPost={this.createPost}
            tipPost={this.tipPost}
         />
        }
       
      </div>
    );
  }
}

export default App;
