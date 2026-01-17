import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Heart, Sparkles, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">

        {/* HERO */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="badge-handmade mb-5 inline-flex">
            <Heart className="w-4 h-4 fill-current" />
            Our Journey
          </span>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
            About LavMe – Fiber Art
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Where every stitch tells a story, and every creation is made with love.
          </p>
        </motion.div>

        {/* STORY */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-16 items-center mb-24"
        >
          <div className="relative">
            <img
              src="https://i.pinimg.com/236x/c8/50/71/c8507111f158904f4e61c40c41dd7a89.jpg"
              alt="Handmade fiber art process"
              className="rounded-3xl shadow-card w-full object-cover"
            />
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-accent/60 rounded-3xl -z-10" />
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-6">
              Our Story
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-4">
              LavMe – MAHESH 
            </p>

            <p className="text-muted-foreground leading-relaxed mb-4">
              Every item in our collection is carefully handmade, ensuring each
              piece carries its own personality and story. From cozy crochet
              creations to intricate yarn art décor, every stitch reflects care,
              patience, and craftsmanship.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              We believe handmade goods create deeper connections, spark joy,
              and add a meaningful, personal touch to modern living.
            </p>
          </div>
        </motion.div>

        {/* VALUES */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-14">
            Our Values
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: "Made with Love",
                description: "Every piece is crafted with care, patience, and heart.",
              },
              {
                icon: Sparkles,
                title: "Quality First",
                description: "Only premium yarns and materials for lasting beauty.",
              },
              {
                icon: Users,
                title: "Community",
                description: "Building meaningful connections through handmade art.",
              },
              {
                icon: Award,
                title: "Uniqueness",
                description: "Each creation is one-of-a-kind, just like you.",
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-7 bg-card rounded-3xl shadow-soft hover:shadow-card transition-all"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* WHAT WE CREATE */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-accent/30 rounded-3xl p-10 md:p-14 mb-24"
        >
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
            What We Create
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Crochet Creations",
              "Knitted Treasures",
              "Yarn Art Décor",
              "Handmade Gifts",
              "Custom Orders",
              "Baby Essentials",
              "Home Accessories",
              "Seasonal Specials",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 p-4 bg-background rounded-xl shadow-soft"
              >
                <span className="w-2.5 h-2.5 bg-primary rounded-full" />
                <span className="text-foreground font-medium">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            Ready to Explore?
          </h2>

          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover our collection of handmade fiber art and find something
            truly special for yourself or someone you love.
          </p>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-10 py-4 bg-primary text-primary-foreground rounded-full font-medium text-lg hover:bg-primary/90 transition-all shadow-elevated"
          >
            Shop Our Collection
          </Link>
        </motion.div>

      </div>
    </Layout>
  );
};

export default About;
