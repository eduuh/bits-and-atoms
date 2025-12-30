export const siteConfig = {
  name: 'EduuhMuraya',
  description: 'A personal developer blog built with Next.js and MDX',
  url: 'https://eduuhmuraya.com',
  ogImage: 'https://eduuhmuraya.com/og.jpg',
  links: {
    github: 'https://github.com/eduuh',
    linkedin: 'https://linkedin.com/in/eduuh',
  },
  about: {
    title: 'About Me',
    description: 'I am a software engineer passionate about building digital products.',
    location: 'Nairobi, Kenya',
    bio: 'I started my coding journey in 2020 and haven\'t looked back since. I love solving complex problems and turning ideas into reality through code.',
    hobbies: ['Coding', 'Reading', 'Gaming'],
  },
  header: {
    logo: {
      text: 'Eduuh',
      highlight: 'Muraya',
    },
  },
  labels: {
    articles: 'Recent Posts',
    categories: 'Browse by Category',
    popular: 'Pinned Content',
    newsletter: {
      title: 'Newsletter',
      description: 'Get the latest posts delivered right to your inbox.',
    },
  },
  nav: [
    { title: 'Home', href: '/' },
    { title: 'Now', href: '/now' },
    { title: 'Series', href: '/series' },
    { title: 'About', href: '/about' },
    { title: 'Topics', href: '/tags' },
    { title: 'RSS', href: '/rss' },
  ],
};

export type SiteConfig = typeof siteConfig;
