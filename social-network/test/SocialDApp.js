const { assert } = require('chai') //librearies
const { default: Web3 } = require('web3')

const SocialDApp = artifacts.require('./SocialDApp.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('SocialDApp',([deployer,author,tipper]) =>{   //call back function
    let social

    before(async()=>{ //has to be used with async
        social=await SocialDApp.deployed()
    })
    describe('deployment', async() =>{
        it('deploys successfully', async() =>{
            const address= await social.address
            assert.notEqual(address,0x0)
            assert.notEqual(address,'')
            assert.notEqual(address,null)
            assert.notEqual(address,undefined)
        })

        it('has a name',async()=>{
            const name=await social.name()
            assert.equal(name,'Decentralized Social Network')
        })
    })


    
    describe('posts',async()=>{
        let result,postCount

        before(async()=>{
            result=await social.createPost("This is my first post",{from:author})
            postCount=await social.postCount()
        })
         
        it('create posts',async()=>{
            
            assert.equal(postCount,1)

            //SUCCESS CASE
            const event=result.logs[0].args
            assert.equal(event.id.toNumber(),postCount.toNumber(),'id id correct')
            assert.equal(event.content,'This is my first post','content id correct')
            assert.equal(event.tipAmount,'0','tip amount is correct')
            assert.equal(event.author,author,'author is correct')

            //FAILURE CASE
            await social.createPost('',{from:author}).should.be.rejected;
        })

        it('lists posts',async()=>{
            const post=await social.posts(postCount)
            assert.equal(post.id.toNumber(),postCount.toNumber(),'id id correct')
            assert.equal(post.content,'This is my first post','content id correct')
            assert.equal(post.tipAmount,'0','tip amount is correct')
            assert.equal(post.author,author,'author is correct')
        })

        it('allows users to tip posts',async()=>{
            //balance before
            let oldAuthorBal
            oldAuthorBal = await web3.eth.getBalance(author)
            oldAuthorBal = new web3.utils.BN(oldAuthorBal)

            result= await social.tipPost(postCount,{from:tipper,value: web3.utils.toWei('1','Ether')})

            //SUCCESS CASE
            const event=result.logs[0].args
            assert.equal(event.id.toNumber(),postCount.toNumber(),'id id correct')
            assert.equal(event.content,'This is my first post','content id correct')
            assert.equal(event.tipAmount,'1000000000000000000','tip amount is correct')
            assert.equal(event.author,author,'author is correct')

            //balance after
            let newAuthorBal
            newAuthorBal = await web3.eth.getBalance(author)
            newAuthorBal = new web3.utils.BN(newAuthorBal)

            let tipAmount
            tipAmount = await web3.utils.toWei('1','Ether')
            tipAmount = new web3.utils.BN(tipAmount)

            const expectedBalance = oldAuthorBal.add(tipAmount)
            //verifying that the amount is being transfered correctly
            assert.equal(newAuthorBal.toString(), expectedBalance.toString())

            //FAILURE CASE : tries to tip a non existing post
            await social.tipPost(99,{from:tipper,value: web3.utils.toWei('1','Ether')}).should.be.rejected;

        })
    })
})