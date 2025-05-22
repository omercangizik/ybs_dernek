const pool = require('../db/mysql_connect');

// Get all jobs
exports.getAllJobs = async (req, res) => {
    try {
        const [jobs] = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
        res.render('jobs/index', {
            title: 'İş İlanları',
            jobs: jobs
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'İş ilanları yüklenirken bir hata oluştu.');
        res.redirect('/');
    }
};

// Get job by ID
exports.getJobById = async (req, res) => {
    try {
        const [jobs] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
        
        if (jobs.length === 0) {
            req.flash('error_msg', 'İş ilanı bulunamadı.');
            return res.redirect('/jobs');
        }

        const job = jobs[0];
        let hasApplied = false;

        if (req.session.user) {
            const [applications] = await pool.query(
                'SELECT * FROM job_applications WHERE user_id = ? AND job_id = ?',
                [req.session.user.id, job.id]
            );
            hasApplied = applications.length > 0;
        }

        res.render('jobs/show', {
            title: job.title,
            job: job,
            hasApplied: hasApplied
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'İş ilanı detayları yüklenirken bir hata oluştu.');
        res.redirect('/jobs');
    }
};

// Apply for job
exports.applyForJob = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const jobId = req.params.id;

        // Check if already applied
        const [existingApplications] = await pool.query(
            'SELECT * FROM job_applications WHERE user_id = ? AND job_id = ?',
            [userId, jobId]
        );

        if (existingApplications.length > 0) {
            req.flash('error_msg', 'Bu iş ilanına zaten başvurdunuz.');
            return res.redirect(`/jobs/${jobId}`);
        }

        // Apply for job
        await pool.query(
            'INSERT INTO job_applications (user_id, job_id, status) VALUES (?, ?, ?)',
            [userId, jobId, 'pending']
        );

        req.flash('success_msg', 'İş başvurunuz başarıyla alındı!');
        res.redirect(`/jobs/${jobId}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'İş başvurusu yapılırken bir hata oluştu.');
        res.redirect(`/jobs/${req.params.id}`);
    }
};

// Get user's job applications
exports.getMyApplications = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [applications] = await pool.query(
            `SELECT j.*, ja.status, ja.created_at as application_date 
            FROM jobs j
            INNER JOIN job_applications ja ON j.id = ja.job_id
            WHERE ja.user_id = ?
            ORDER BY ja.created_at DESC`,
            [userId]
        );

        res.render('jobs/my-applications', {
            title: 'Başvurularım',
            applications: applications
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Başvurularınız yüklenirken bir hata oluştu.');
        res.redirect('/jobs');
    }
}; 