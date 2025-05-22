const pool = require('../db/mysql_connect');

// Get all trainings
exports.getAllTrainings = async (req, res) => {
    try {
        const [trainings] = await pool.query('SELECT * FROM trainings ORDER BY start_date DESC');
        res.render('trainings/index', {
            title: 'Eğitimler',
            trainings: trainings
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Eğitimler yüklenirken bir hata oluştu.');
        res.redirect('/');
    }
};

// Get training by ID
exports.getTrainingById = async (req, res) => {
    try {
        const [trainings] = await pool.query('SELECT * FROM trainings WHERE id = ?', [req.params.id]);
        
        if (trainings.length === 0) {
            req.flash('error_msg', 'Eğitim bulunamadı.');
            return res.redirect('/trainings');
        }

        const training = trainings[0];
        let isRegistered = false;

        if (req.session.user) {
            const [registrations] = await pool.query(
                'SELECT * FROM training_registrations WHERE user_id = ? AND training_id = ?',
                [req.session.user.id, training.id]
            );
            isRegistered = registrations.length > 0;
        }

        res.render('trainings/show', {
            title: training.title,
            training: training,
            isRegistered: isRegistered
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Eğitim detayları yüklenirken bir hata oluştu.');
        res.redirect('/trainings');
    }
};

// Register for training
exports.registerForTraining = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const trainingId = req.params.id;

        // Check if already registered
        const [existingRegistrations] = await pool.query(
            'SELECT * FROM training_registrations WHERE user_id = ? AND training_id = ?',
            [userId, trainingId]
        );

        if (existingRegistrations.length > 0) {
            req.flash('error_msg', 'Bu eğitime zaten kayıtlısınız.');
            return res.redirect(`/trainings/${trainingId}`);
        }

        // Register for training
        await pool.query(
            'INSERT INTO training_registrations (user_id, training_id) VALUES (?, ?)',
            [userId, trainingId]
        );

        req.flash('success_msg', 'Eğitime başarıyla kayıt oldunuz!');
        res.redirect(`/trainings/${trainingId}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Eğitime kayıt olurken bir hata oluştu.');
        res.redirect(`/trainings/${req.params.id}`);
    }
};

// Get user's registered trainings
exports.getMyTrainings = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [trainings] = await pool.query(
            `SELECT t.* FROM trainings t
            INNER JOIN training_registrations tr ON t.id = tr.training_id
            WHERE tr.user_id = ?
            ORDER BY t.start_date DESC`,
            [userId]
        );

        res.render('trainings/my-trainings', {
            title: 'Katıldığım Eğitimler',
            trainings: trainings
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Eğitimleriniz yüklenirken bir hata oluştu.');
        res.redirect('/trainings');
    }
}; 