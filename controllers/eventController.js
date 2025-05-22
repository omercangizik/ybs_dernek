const pool = require('../db/mysql_connect');

// Get all events
exports.getAllEvents = async (req, res) => {
    try {
        const [events] = await pool.query('SELECT * FROM events ORDER BY date DESC');
        res.render('events/index', {
            title: 'Etkinlikler',
            events: events
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Etkinlikler yüklenirken bir hata oluştu.');
        res.redirect('/');
    }
};

// Get event by ID
exports.getEventById = async (req, res) => {
    try {
        const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        
        if (events.length === 0) {
            req.flash('error_msg', 'Etkinlik bulunamadı.');
            return res.redirect('/events');
        }

        const event = events[0];
        let isRegistered = false;

        if (req.session.user) {
            const [registrations] = await pool.query(
                'SELECT * FROM event_registrations WHERE user_id = ? AND event_id = ?',
                [req.session.user.id, event.id]
            );
            isRegistered = registrations.length > 0;
        }

        res.render('events/show', {
            title: event.title,
            event: event,
            isRegistered: isRegistered
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Etkinlik detayları yüklenirken bir hata oluştu.');
        res.redirect('/events');
    }
};

// Register for event
exports.registerForEvent = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const eventId = req.params.id;

        // Check if already registered
        const [existingRegistrations] = await pool.query(
            'SELECT * FROM event_registrations WHERE user_id = ? AND event_id = ?',
            [userId, eventId]
        );

        if (existingRegistrations.length > 0) {
            req.flash('error_msg', 'Bu etkinliğe zaten kayıtlısınız.');
            return res.redirect(`/events/${eventId}`);
        }

        // Register for event
        await pool.query(
            'INSERT INTO event_registrations (user_id, event_id) VALUES (?, ?)',
            [userId, eventId]
        );

        req.flash('success_msg', 'Etkinliğe başarıyla kayıt oldunuz!');
        res.redirect(`/events/${eventId}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Etkinliğe kayıt olurken bir hata oluştu.');
        res.redirect(`/events/${req.params.id}`);
    }
};

// Get user's registered events
exports.getMyEvents = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [events] = await pool.query(
            `SELECT e.* FROM events e
            INNER JOIN event_registrations er ON e.id = er.event_id
            WHERE er.user_id = ?
            ORDER BY e.date DESC`,
            [userId]
        );

        res.render('events/my-events', {
            title: 'Katıldığım Etkinlikler',
            events: events
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Etkinlikleriniz yüklenirken bir hata oluştu.');
        res.redirect('/events');
    }
}; 