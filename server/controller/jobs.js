const Job = require('../models/jobs');

const isActualDate = (value) => {
    if (!value || typeof value !== 'string') return false;

    const trimmedValue = value.trim().toLowerCase();
    if (trimmedValue === '') return false;

    const placeholderKeywords = [
        'before exam', 'not available', 'n/a', 'na', 'awaited', 'will be announced',
        'to be announced', 'tba', 'coming soon', 'not released', 'not yet',
        'soon', 'shortly', 'later', 'after', 'update'
    ];

    if (placeholderKeywords.some(keyword => trimmedValue.includes(keyword))) return false;

    const datePatterns = [
        /\d{1,2}[-\/\s](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
        /\d{1,2}[-\/\s]\d{1,2}[-\/\s]\d{2,4}/,
        /\d{4}[-\/\s]\d{1,2}[-\/\s]\d{1,2}/,
        /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}/i,
        /\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
        /\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i
    ];

    return datePatterns.some(pattern => pattern.test(trimmedValue));
};

const hasAdmitCard = (job) => {
    if (!job.data?.importantDates) return false;

    const match = job.data.importantDates.find(d => {
        const label = d.label?.toLowerCase() || '';
        return (
            label.includes('admit card') ||
            label.includes('hall ticket') ||
            label.includes('call letter') ||
            label.includes('e-admit')
        );
    });

    return match?.value ? isActualDate(match.value) : false;
};

const hasResult = (job) => {
    if (!job.data?.importantDates) return false;

    const match = job.data.importantDates.find(d => {
        const label = d.label?.toLowerCase() || '';
        return (
            label.includes('result') ||
            label.includes('score') ||
            label.includes('merit list') ||
            label.includes('final result') ||
            label.includes('selection list')
        );
    });

    return match?.value ? isActualDate(match.value) : false;
};

const getAdmitCardLink = (job) => {
    if (!job.data?.importantLinks) return null;

    const link = job.data.importantLinks.find(l => {
        const label = l.label?.toLowerCase() || '';
        return (
            (label.includes('admit card') ||
                label.includes('hall ticket') ||
                label.includes('call letter') ||
                label.includes('download admit')) &&
            !label.includes('notice') &&
            !label.includes('instruction')
        );
    });

    return link?.url || null;
};

const getResultLink = (job) => {
    if (!job.data?.importantLinks) return null;

    const link = job.data.importantLinks.find(l => {
        const label = l.label?.toLowerCase() || '';
        return (
            (label.includes('result') ||
                label.includes('download result') ||
                label.includes('check result') ||
                label.includes('merit list') ||
                label.includes('final result')) &&
            !label.includes('notice')
        );
    });

    return link?.url || null;
};

const getExamDate = (job) => {
    if (!job.data?.importantDates) return null;

    const match = job.data.importantDates.find(d => {
        const label = d.label?.toLowerCase() || '';
        return (
            label.includes('exam date') ||
            label.includes('examination date') ||
            label.includes('test date') ||
            label.includes('cbt date')
        );
    });

    return match?.value || null;
};

const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createJob = async (req, res) => {
    try {
        const job = new Job(req.body);
        const saved = await job.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json({ message: 'Job deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getAdmitCard = async (req, res) => {
    try {
        const { page = 1, limit = 10, tag, organization } = req.query;
        const jobs = await Job.find().sort({ createdAt: -1 });

        let filtered = jobs.filter(hasAdmitCard);

        if (tag) {
            filtered = filtered.filter(j =>
                j.data?.tag?.toLowerCase() === tag.toLowerCase()
            );
        }

        if (organization) {
            filtered = filtered.filter(j =>
                j.data?.organization?.toLowerCase().includes(organization.toLowerCase())
            );
        }

        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + parseInt(limit));

        const formatted = paginated.map(job => ({
            _id: job._id,
            postName: job.postName,
            organization: job.data?.organization,
            tag: job.data?.tag,
            shortInfo: job.data?.shortInfo,
            admitCard: {
                available: true,
                date: job.data.importantDates.find(d =>
                    d.label.toLowerCase().includes("admit card")
                )?.value,
                link: getAdmitCardLink(job)
            },
            examDate: getExamDate(job),
            createdAt: job.createdAt
        }));

        res.json({
            success: true,
            count: filtered.length,
            page: parseInt(page),
            totalPages: Math.ceil(filtered.length / limit),
            data: formatted
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getResult = async (req, res) => {
    try {
        const { page = 1, limit = 10, tag, organization } = req.query;
        const jobs = await Job.find().sort({ createdAt: -1 });

        let filtered = jobs.filter(hasResult);

        if (tag) {
            filtered = filtered.filter(j =>
                j.data?.tag?.toLowerCase() === tag.toLowerCase()
            );
        }

        if (organization) {
            filtered = filtered.filter(j =>
                j.data?.organization?.toLowerCase().includes(organization.toLowerCase())
            );
        }

        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + parseInt(limit));

        const formatted = paginated.map(job => ({
            _id: job._id,
            postName: job.postName,
            organization: job.data?.organization,
            tag: job.data?.tag,
            shortInfo: job.data?.shortInfo,
            result: {
                available: true,
                date: job.data.importantDates.find(d =>
                    d.label.toLowerCase().includes("result")
                )?.value,
                link: getResultLink(job)
            },
            examDate: getExamDate(job),
            createdAt: job.createdAt
        }));

        res.json({
            success: true,
            count: filtered.length,
            page: parseInt(page),
            totalPages: Math.ceil(filtered.length / limit),
            data: formatted
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAdmitCardById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        if (!hasAdmitCard(job))
            return res.status(404).json({ success: false, message: 'Admit card not available' });

        const date = job.data?.importantDates.find(d =>
            d.label.toLowerCase().includes("admit card")
        );

        const links = job.data?.importantLinks?.filter(l => {
            const label = l.label.toLowerCase();
            return label.includes("admit") || label.includes("hall ticket");
        });

        res.json({
            success: true,
            data: {
                jobId: job._id,
                postName: job.postName,
                organization: job.data?.organization,
                admitCard: {
                    available: true,
                    date: date?.value,
                    link: getAdmitCardLink(job)
                },
                examDate: getExamDate(job),
                relatedLinks: links
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getResultById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        if (!hasResult(job))
            return res.status(404).json({ success: false, message: 'Result not available' });

        const date = job.data?.importantDates.find(d =>
            d.label.toLowerCase().includes("result")
        );

        const links = job.data?.importantLinks?.filter(l => {
            const label = l.label.toLowerCase();
            return (
                label.includes("result") ||
                label.includes("answer key") ||
                label.includes("merit") ||
                label.includes("cutoff")
            );
        });

        res.json({
            success: true,
            data: {
                jobId: job._id,
                postName: job.postName,
                organization: job.data?.organization,
                result: {
                    available: true,
                    date: date?.value,
                    link: getResultLink(job)
                },
                examDate: getExamDate(job),
                relatedLinks: links
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const isExamJob = (job) => {
    const tag = job.data?.tag?.toLowerCase() || '';
    const post = job.postName?.toLowerCase() || '';

    if (
        tag.includes("exam") ||
        tag.includes("cbt") ||
        tag.includes("test") ||
        post.includes("exam") ||
        post.includes("test")
    ) return true;

    return job.data?.importantDates?.some(d => {
        const label = d.label?.toLowerCase() || '';
        return (
            label.includes("exam") ||
            label.includes("test") ||
            label.includes("cbt") ||
            label.includes("main") ||
            label.includes("pre")
        );
    });
};

const getExams = async (req, res) => {
    try {
        const { page = 1, limit = 10, tag, organization } = req.query;
        const jobs = await Job.find().sort({ createdAt: -1 });

        let filtered = jobs.filter(isExamJob);

        if (tag) {
            filtered = filtered.filter(j =>
                j.data?.tag?.toLowerCase()?.includes(tag.toLowerCase())
            );
        }

        if (organization) {
            filtered = filtered.filter(j =>
                j.data?.organization?.toLowerCase()?.includes(organization.toLowerCase())
            );
        }

        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + parseInt(limit));

        const formatted = paginated.map(job => ({
            _id: job._id,
            postName: job.postName,
            organization: job.data?.organization,
            tag: job.data?.tag,
            shortInfo: job.data?.shortInfo,
            examDates:
                job.data?.importantDates
                    ?.filter(d => {
                        const label = d.label.toLowerCase();
                        return (
                            label.includes("exam") ||
                            label.includes("test") ||
                            label.includes("cbt")
                        );
                    })
                    .map(d => ({ label: d.label, value: d.value })) || [],
            createdAt: job.createdAt
        }));

        res.json({
            success: true,
            count: filtered.length,
            page: parseInt(page),
            totalPages: Math.ceil(filtered.length / limit),
            data: formatted
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
const getStats = async (req, res) => {
    try {
        const jobs = await Job.find();
        const totalJobs = jobs.length;
        const admitCardJobs = jobs.filter(hasAdmitCard).length;
        const resultJobs = jobs.filter(hasResult).length;
        const examJobs = jobs.filter(isExamJob).length;
        res.json({
            totalJobs,
            admitCardJobs,
            resultJobs,
            examJobs
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getJobs,
    getJobById,
    createJob,
    deleteJob,
    updateJob,
    getAdmitCard,
    getResult,
    getAdmitCardById,
    getResultById,
    getExams,
    getStats
};
