const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jobSchema = new Schema({
    // 1. Basic Header Info
    postName: { type: String, required: true }, // e.g., "Railway RRB Group D..."
    shortInfo: { type: String }, // Wo lamba paragraph jo shuru mein hota hai
    postDate: { type: Date, default: Date.now },
    updateDate: { type: Date, default: Date.now },

    // 2. Categorization (Result, Admit Card, Job, etc.)
    category: {
        type: String,
        enum: ['Latest Jobs', 'Admit Card', 'Result', 'Answer Key', 'Syllabus'],
        required: true
    },

    // 3. Important Dates (Box 1)
    importantDates: [{
        label: { type: String }, // e.g., "Application Begin"
        value: { type: String }  // e.g., "23/01/2025"
    }],

    // 4. Application Fee (Box 2)
    applicationFee: [{
        category: { type: String }, // e.g., "General / OBC / EWS"
        amount: { type: String }    // e.g., "500/-"
    }],
    paymentMode: { type: String }, // e.g., "Debit Card / Credit Card / Net Banking"

    // 5. Age Limit (Box 3)
    ageLimit: {
        asOnDate: { type: String }, // e.g., "01/01/2025"
        minAge: { type: String },
        maxAge: { type: String },
        details: [{ type: String }] // Extra rules like "Age relaxation extra as per rules"
    },

    // 6. Vacancy Details (The Big Table)
    vacancyDetails: [{
        postName: { type: String },  // e.g., "Group D"
        totalPost: { type: String }, // e.g., "1,03,769"
        eligibility: { type: String } // e.g., "Class 10th High School Passed..."
    }],

    // 7. Important Links (The Bottom Section)
    importantLinks: [{
        label: { type: String }, // e.g., "Check Exam City / Date"
        url: { type: String },   // Link destination
        isNew: { type: Boolean, default: false } // Blinking "New" tag ke liye
    }]
}, { timestamps: true });


module.exports = mongoose.model('Job', jobSchema);