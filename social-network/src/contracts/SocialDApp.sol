//SPDX-Liscense-Identifier: UNLISCENSED
pragma solidity ^0.5.0;

contract SocialDApp{
    string public name;
    uint public postCount=0;
    mapping(uint=>Post) public posts;

    struct Post{
        uint id;
        string content;
        uint tipAmount;
        address payable author;
    }

    event PostCreated(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    event PostTipped(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    constructor() public{
        name  = "Decentralized Social Network";
    }

    function createPost(string memory _content) public{
        require(bytes(_content).length>0);

        postCount++;
        posts[postCount]=Post(postCount,_content,0,msg.sender); //mapping post to its id
        //Trigger event
        emit PostCreated(postCount,_content,0,msg.sender);
    }

    function tipPost(uint _id) public payable{
        //to make sure that the id is valid
        require(_id>0 && _id<= postCount);
         
        //Fetch the post
        Post memory _post=posts[_id];

        //Fetch the author
        address payable _author = _post.author;

        //pay the author by sending ether
        //1 Ether = 10^18 Wei
        address(_author).transfer(msg.value);

        //Incrementing or adding tip
        _post.tipAmount=_post.tipAmount + msg.value;  //use of metadata

        //Update the post
        posts[_id] = _post;

        //Trigger the event
        emit PostTipped(postCount, _post.content, _post.tipAmount, _author);
    }
}

