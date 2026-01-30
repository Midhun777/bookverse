const mongoose = require('mongoose');

const AdminSettingsSchema = new mongoose.Schema({
    featuredCategories: {
        type: [String],
        default: ['Fiction', 'Technology', 'Science', 'History']
    },
    homepageBannerText: {
        type: String,
        default: 'Welcome to Bookverse'
    }
});

module.exports = mongoose.model('AdminSettings', AdminSettingsSchema);
