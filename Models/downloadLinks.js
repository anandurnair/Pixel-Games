const mongoose = require("../config/db"); 

const downloadLinksSchema = [
    {
        userId:  {
            type: Schema.Types.ObjectId,
            ref: 'users', 
            required: true,
          },
        gameId:  {
            type: Schema.Types.ObjectId,
            ref: 'games', 
            required: true,
          },
        token: String,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), 
        maxDownloads: 1, 
        downloadsLeft: 1, 
        usedBy: [], 
    },
    
];
const downloadLinks = mongoose.model('downloadLinks', downloadLinksSchema);

module.exports = downloadLinks;
