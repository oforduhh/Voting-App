const express = require( "express" );
const userRouter = express.Router();
userRouter.use( express.urlencoded( { extended: false } ) );
const User = require( "../models/userModel" );
const bcrypt = require( "bcryptjs" );
const passport = require( "passport" );
const Pusher = require( "pusher" );
const mongoose = require( "mongoose" );
const Vote = require( "../models/voteModel" );

// login page
userRouter.get( "/login", ( req, res ) => {
  res.render( "login" );
} );
// register page
userRouter.get( "/register", ( req, res ) => {
  res.render( "register" );
} );

// register handle
userRouter.post( "/register", ( req, res ) => {
  const { name, email, password, password2 } = req.body;
  const errors = [];

  // check required field
  if ( !name || !email || !password || !password2 ) {
    errors.push( { msg: "please fill in the field" } );
  }
  // check if password match
  if ( password2 !== password ) {
    errors.push( { msg: "Passwords do not match" } );
  }

  // check is password length is greater than 6
  if ( password.length < 6 ) {
    errors.push( { msg: "Password should be atleast 6 characters long" } );
  }

  // if any issues arise
  if ( errors.length > 0 ) {
    res.render( "register", { errors, name, email, password, password2 } );
  } else {
    // validation passed

    // to check if a user already exist
    User.findOne( { email: email } ).then( ( user ) => {
      if ( user ) {
        errors.push( { msg: "Email is already registered" } );
        res.render( "register", { errors, name, email, password, password2 } );
      } else {
        const newUser = new User( {
          name,
          email,
          password,

        } );
        bcrypt.genSalt( 10, function ( err, salt ) {
          bcrypt.hash( newUser.password, salt, ( err, hash ) => {
            if ( err ) {
              throw err;
            }
            // set password to be hashed
            newUser.password = hash;

            // save new user
            newUser.save().then( ( user ) => {
              //isVoted should be false by default
              user.isVoted = false;
              user.save();
              req.flash( "success_msg", "You are now registered and can login" );
              res.redirect( "/users/login" );
            } );
          } );
        } );
      }
    } );
  }
  // console.log(errors);
} );
// Login
userRouter.post( "/login", ( req, res, next ) => {
  passport.authenticate( "local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  } )( req, res, next );
} );

// Logout
userRouter.get( "/logout", ( req, res ) => {
  req.logout();
  req.flash( "success_msg", "You are logged out" );
  res.redirect( "/users/login" );
} );

// Voting Poll

let pusher = new Pusher( {
  appId: "1017636",
  key: "10cbea74ace6795eed9a",
  secret: "b61a2565f6bc4f8ba201",
  cluster: "eu",
  encrypted: true,
} );

userRouter.get( "/poll", ( req, res ) => {
  Vote.find().then( ( votes ) => {
    res.json( { success: true, votes: votes } );
  } );
} );

// create a post request to handle the form that will trigger the pusher
userRouter.post( "/poll", ( req, res ) => {
  const newVote = {
    os: req.body.os,
    points: 1,
  };
  //Find User by Id(Id is gotten from the user object in the request)
  User.findById( req.user._id )
    .then( data => {
      //Check to see if the person has voted already
      if ( data.isVoted ) {
        return res.json( {  message: "Sorry you can only vote once" } );
      } else {
        // the Vote is the model that was brought in
        //This code will only run if is voted is false
        new Vote( newVote ).save().then( ( vote ) => {
          pusher.trigger( "os-poll", "os-vote", {
            points: parseInt( vote.points ),
            os: vote.os,
          } );
         
          
        } )
          .then( () => {
            res.json( { message: "Thank you for voting" } );
            //Set the user's isVoted to true
            data.isVoted = true;
            data.save()
          } )
          .catch(err=> console.log(err))
          .catch( err => console.log( err ) )
      }
      // console.log(data)
    } )
    .catch( err => console.log( err ) )


} );

module.exports = userRouter;
