require('dotenv').config({ path: './backend/.env' });
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cloudinary = require('./config/cloudinary');
const upload = require('./config/multer-config');
const authRoutes = require('./routes/authRoutes');

const authMiddleware = require('./middleware/auth');

const authController = require('./controllers/authController');
const Project = require('./models/Projects');
const Logo = require('./models/Logo');
const Blog = require('./models/Blogs');
const Testimonial = require('./models/Testimonials');
const Client = require('./models/Clients');
const app = express();

app.use(express.static(path.join(__dirname, '../assets')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
    })
);

app.use('/api/auth', authRoutes);

app.get('/', async (req, res) => {
    try {
        const logos = await Logo.find({ listed: true });
        const testimonials = await Testimonial.find({ listed: true });
        const projects = await Project.find({ listed: true });
        const blogs = await Blog.find({ listed: true });
        const clients = await Client.find({ listed: true });
        res.render('index', {
            title: 'Home page',
            Logo: logos,
            testimonials: testimonials,
            projects: projects,
            blogs: blogs,
            clients: clients
        });
    } catch (err) {
        console.error('Error rendering home page:', err.message);
        res.status(500).send('Error loading the home page');
    }
});
app.get('/about', async (req, res) => {
    try {
        const logos = await Logo.find({ listed: true });
        res.render('about', {
            title: 'about page',
            Logo: logos
        });
    } catch (err) {
        console.error('Error rendering about us page:', err.message);
        res.status(500).send('Error loading the about page');
    }
});
app.get('/contact', async (req, res) => {
    try {
        const logos = await Logo.find({ listed: true });
        res.render('contact', {
            title: 'contact page',
            Logo: logos
        });
    } catch (err) {
        console.error('Error rendering contact us page:', err.message);
        res.status(500).send('Error loading the contact page');
    }
});
app.get('/blogs', async (req, res) => {
    try {
        const logos = await Logo.find({ listed: true });
        const blogs = await Blog.find({ listed: true });
        res.render('blogs', {
            title: 'blogs page',
            Logo: logos,
            blogs: blogs
        });
    } catch (err) {
        console.error('Error rendering blogs page:', err.message);
        res.status(500).send('Error loading the blogs page');
    }
});

app.get('/blogs/:id', async (req, res) => {
    try {
        const logos = await Logo.find({ listed: true });
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        res.render('blog-details', {
            title: blog.title,
            Logo: logos,
            blog: blog
        });
    } catch (err) {
        console.error('Error rendering blog details page:', err.message);
        res.status(500).send('Error loading the blog details page');
    }
});
app.get('/projects', async (req, res) => {
    try {
        const logos = await Logo.find({ listed: true });
        const projects = await Project.find({ listed: true });
        res.render('projects', {
            title: 'projects page',
            Logo: logos,
            projects: projects
        });
    } catch (err) {
        console.error('Error rendering projects page:', err.message);
        res.status(500).send('Error loading the projects page');
    }
});

app.get('/projects/:id', async (req, res) => {
    try {
        const logos = await Logo.find({ listed: true });
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).send('Project not found');
        }
        res.render('project-details', {
            title: project.title,
            Logo: logos,
            project: project
        });
    } catch (err) {
        console.error('Error rendering project details page:', err.message);
        res.status(500).send('Error loading the project details page');
    }
});
app.get('/services', async (req, res) => {
    try {
        const logos = await Logo.find({ listed: true });
        res.render('services', {
            title: 'service page',
            Logo: logos
        });
    } catch (err) {
        console.error('Error rendering services page:', err.message);
        res.status(500).send('Error loading the services page');
    }
});
app.get('/web-development', async (req, res) => {
    try {
        const logos = await Logo.find({ listed: true });
        const testimonials = await Testimonial.find({ listed: true });
        res.render('web-development', {
            title: 'web-development page',
            Logo: logos,
            testimonials: testimonials,
        });
    } catch (err) {
        console.error('Error rendering web-development page:', err.message);
        res.status(500).send('Error loading the services page');
    }
});

app.get('/admin-dashboard', async (req, res) => {
    if (req.session && req.session.user) {
        try {
            const logodata=Logo.find({ listed: true })
            const projects = await Project.find();
            res.render('admin-dashboard', {
                title: 'Admin dashboard',
                projects: projects,
                Logo: logodata
            });
        } catch (error) {
            console.error('Error fetching projects:', error);
            res.render('admin-dashboard', {
                title: 'Admin dashboard',
                projects: [],
                Logo: []
            });
        }
    } else {
        res.redirect('/login');
    }
});


app.get('/login', (req, res) => {
    res.render('login', { title: 'Admin Login' });
});
app.get('/logout', authController.logout);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error',
        error: {
            message: err.message,
            status: err.status || 500,
            stack: process.env.NODE_ENV === 'development' ? err.stack : ''
        }
    });
});

// projects section 

app.post('/create-project', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, date, description, liveLink, category, listed } = req.body;
        let image = null;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            image = result.secure_url;
        }

        // Validate input
        if (!title || !date || !description || !category) {
            return res.status(400).json({ message: 'Required fields are missing!' });
        }

        const project = new Project({
            title,
            date,
            description,
            liveLink,
            category,
            listed: listed !== undefined ? listed : true,
            image
        });

        await project.save();
        res.status(201).json({ message: 'Project created successfully', project });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error creating the project' });
    }
});

// Edit a project
app.put('/edit-project/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, date, description, liveLink, category, listed } = req.body;
        let updateData = { title, date, description, liveLink, category, listed };

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            updateData.image = result.secure_url;
        }

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json({ message: 'Project updated successfully', project: updatedProject });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error updating the project' });
    }
});

// Delete a project
app.delete('/delete-project/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Delete image from Cloudinary if it exists
        if (project.image) {
            const publicId = project.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await Project.findByIdAndDelete(id);
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error deleting the project' });
    }
});

// Toggle the 'listed' status of a project
app.patch('/toggle-list-project/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.listed = !project.listed;
        await project.save();

        res.status(200).json({ message: 'Project listing status toggled successfully', project });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error toggling project listing status' });
    }
});

// logo management 

app.get('/admin-logo', async (req, res) => {
    if (req.session && req.session.user) {
        try {
            const logos = await Logo.find();
            res.render('admin-logo', {
                title: 'Admin logo',
                Logo: logos
            });
        } catch (error) {
            console.error('Error fetching logo:', error);
            res.render('admin-logo', {
                title: 'Admin logo', 
                Logo: []
            });
        }
    } else {
        res.redirect('/login');
    }
});
app.post('/create-logo', upload.single('image'), async (req, res) => {
    try {
        const { title, listed } = req.body;

        // Validate input
        if (!req.file || !title) {
            return res.status(400).json({ message: 'Image and title are required!' });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);

        const logo = new Logo({
            image: result.secure_url,
            title,
            listed: listed !== undefined ? listed : true,
        });

        await logo.save();
        res.status(201).json({ message: 'Logo created successfully', logo });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error creating the logo' });
    }
});

// Edit a logo
app.put('/edit-logo/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, listed } = req.body;

        const logo = await Logo.findById(id);
        if (!logo) {
            return res.status(404).json({ message: 'Logo not found' });
        }

        const updateData = {
            title,
            listed
        };

        // Handle image update if new file uploaded
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (logo.image) {
                const publicId = logo.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }

            // Upload new image
            const result = await cloudinary.uploader.upload(req.file.path);
            updateData.image = result.secure_url;
        }

        const updatedLogo = await Logo.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Logo updated successfully', logo: updatedLogo });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error updating the logo' });
    }
});

// Delete a logo
app.delete('/delete-logo/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const logo = await Logo.findById(id);
        if (!logo) {
            return res.status(404).json({ message: 'Logo not found' });
        }

        if (logo.image) {
            const publicId = logo.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }
        await Logo.findByIdAndDelete(id);
        res.status(200).json({ message: 'Logo deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error deleting the logo' });
    }
});

// List all logos
app.put('/toggle-logo/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const logo = await Logo.findById(id);
        if (!logo) {
            return res.status(404).json({ message: 'Logo not found' });
        }
        logo.listed = !logo.listed;
        await logo.save();
        res.status(200).json({
            message: 'Logo status toggled successfully',
            logo: logo
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error toggling logo status' });
    }
});

// blogs management 
app.get('/admin-blogs', async (req, res) => {
    if (req.session && req.session.user) {
        try {
            const [Blogs, LogoData] = await Promise.all([
                Blog.find(),
                Logo.find({ listed: true })
            ]);
            res.render('admin-blogs', {
                title: 'Admin blogs',
                Blog: Blogs,
                Logo: LogoData
            });
        } catch (error) {
            console.error('Error fetching blogs:', error);
            res.render('admin-blogs', {
                title: 'Admin blogs', 
                Blog: [],
                Logo: []
            });
        }
    } else {
        res.redirect('/login');
    }
});
app.post('/create-blogs', upload.single('image'), async (req, res) => {
    try {
        const { title, description, authorName, industry } = req.body;

        const imageUrl = req.file ? req.file.path : null;

        const newBlog = new Blog({
            image: imageUrl,
            title,
            description,
            authorName,
            industry,
        });

        const savedBlog = await newBlog.save();
        res.status(201).json({ message: 'Blog created successfully', blog: savedBlog });
    } catch (error) {
        res.status(500).json({ message: 'Error creating blog', error: error.message });
    }
});

// Route to edit an existing blog
app.put('/edit-blogs/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, authorName, industry, listed } = req.body;

        let updatedData = { title, description, authorName, industry, listed };

        if (req.file) {
            const imageUrl = req.file.path;
            updatedData.image = imageUrl;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.status(200).json({ message: 'Blog updated successfully', blog: updatedBlog });
    } catch (error) {
        res.status(500).json({ message: 'Error updating blog', error: error.message });
    }
});

// Route to toggle blog listing status
app.patch('/toggle-listing-blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        blog.listed = !blog.listed;
        await blog.save();

        res.status(200).json({ message: 'Blog listing status toggled successfully', blog });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling blog listing status', error: error.message });
    }
});

// Route to delete a blog
app.delete('/delete-blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        const publicId = blog.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`blogs/${publicId}`);

        await Blog.findByIdAndDelete(id);

        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting blog', error: error.message });
    }
});

// testimonials management 
app.get('/admin-testimonials', async (req, res) => {
    if (req.session && req.session.user) {
        try {
            const [testimonials, LogoData] = await Promise.all([
                Testimonial.find(),
                Logo.find({ listed: true })
            ]);
            res.render('admin-testimonials', {
                title: 'Admin testimonials',
                Testimonial: testimonials,
                Logo: LogoData
            });
        } catch (error) {
            console.error('Error fetching blogs:', error);
            res.render('admin-testimonials', {
                title: 'Admin blogs', 
                Testimonial: [],
                Logo: []
            });
        }
    } else {
        res.redirect('/login');
    }
});
app.post('/create-testimonials', upload.single('image'), async (req, res) => {
    try {
        const { description, title } = req.body;
        const imageUrl = req.file ? req.file.path : null;

        const newTestimonial = new Testimonial({
            image: imageUrl,
            description,
            title,
        });

        const savedTestimonial = await newTestimonial.save();
        res.status(201).json({ message: 'Testimonial created successfully', testimonial: savedTestimonial });
    } catch (error) {
        res.status(500).json({ message: 'Error creating testimonial', error: error.message });
    }
});

// Route to edit an existing testimonial
app.put('/edit-testimonials/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { description, title, listed } = req.body;

        let updatedData = { description, title, listed };

        if (req.file) {
            const imageUrl = req.file.path;
            updatedData.image = imageUrl;
        }

        const updatedTestimonial = await Testimonial.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedTestimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        res.status(200).json({ message: 'Testimonial updated successfully', testimonial: updatedTestimonial });
    } catch (error) {
        res.status(500).json({ message: 'Error updating testimonial', error: error.message });
    }
});

// Route to toggle testimonial listing status
app.patch('/toggle-listing-testimonials/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        testimonial.listed = !testimonial.listed;
        await testimonial.save();

        res.status(200).json({ message: 'Testimonial listing status toggled successfully', testimonial });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling testimonial listing status', error: error.message });
    }
});

// Route to delete a testimonial
app.delete('/delete-testimonials/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        // Delete the associated image from Cloudinary (if exists)
        if (testimonial.image) {
            const publicId = testimonial.image.split('/').pop().split('.')[0]; // Extract public ID
            await cloudinary.uploader.destroy(`testimonials/${publicId}`);
        }

        await Testimonial.findByIdAndDelete(id);

        res.status(200).json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting testimonial', error: error.message });
    }
});


app.get('/admin-clients', async (req, res) => {
    if (req.session && req.session.user) {
        try {
            const [clients, LogoData] = await Promise.all([
                Client.find(),
                Logo.find({ listed: true })
            ]);
            res.render('admin-clients', {
                title: 'Admin clients',
                Client: clients,
                Logo: LogoData
            });
        } catch (error) {
            console.error('Error fetching clients:', error);
            res.render('admin-clients', {
                title: 'Admin clients', 
                Client: [],
                Logo: []
            });
        }
    } else {
        res.redirect('/login');
    }
});

// CREATE a new client
app.post('/create-clients', upload.single('image'), async (req, res) => {
    try {
        const { title, listed } = req.body;

        if (!req.file || !title) {
            return res.status(400).json({ message: 'Image and title are required.' });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'clients'
        });

        const newClient = new Client({
            image: result.secure_url,
            title,
            listed: listed || true,
        });

        await newClient.save();
        res.status(201).json({ message: 'Client created successfully.', client: newClient });
    } catch (error) {
        res.status(500).json({ message: 'Error creating client.', error: error.message });
    }
});

// EDIT an existing client
app.put('/edit-clients/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, listed } = req.body;

        const client = await Client.findById(id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }

        // If new image uploaded, update it in Cloudinary
        if (req.file) {
            // Delete old image if exists
            if (client.image) {
                const publicId = client.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`clients/${publicId}`);
            }

            // Upload new image
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'clients'
            });
            client.image = result.secure_url;
        }

        client.title = title || client.title;
        client.listed = listed !== undefined ? listed : client.listed;

        await client.save();
        res.status(200).json({ message: 'Client updated successfully.', client });
    } catch (error) {
        res.status(500).json({ message: 'Error updating client.', error: error.message });
    }
});

// TOGGLE client listing status
app.put('/toggle-listed-clients/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const client = await Client.findById(id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }

        client.listed = !client.listed;

        await client.save();
        res.status(200).json({ message: 'Client listing status toggled successfully.', client });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling client listing status.', error: error.message });
    }
});

// DELETE a client
app.delete('/delete-clients/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const client = await Client.findById(id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }

        // Delete image from Cloudinary if exists
        if (client.image) {
            const publicId = client.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`clients/${publicId}`);
        }

        await Client.findByIdAndDelete(id);
        res.status(200).json({ message: 'Client deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting client.', error: error.message });
    }
});
module.exports = app;