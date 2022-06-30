const express = require("express");

const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({
    title: String,
    cateogary: String,
    author:String,
    tags: [String],
    img:
    {
        data: Buffer,
        contentType: String
    },
    details: String,



    answers: [{
        author:String,
        answer: String,
        date_answer: String,
        img: {
            data: Buffer,
            contentType: String
        },
        comment: [
            {
                commentbody: String,
                commentdate: String
            }
        ]
    }]
    ,

    date: String,
    questComment: [{
        author:String,
        qcommment: String,
        date_comment: String
    }
    ],
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: Number,
})

module.exports = mongoose.model("Question", questionSchema)