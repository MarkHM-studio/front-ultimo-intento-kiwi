import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Wine,
  UtensilsCrossed,
  Clock,
  MapPin,
  Phone,
  Calendar,
  Users,
  Star,
  ChevronRight,
  GlassWater,
  ChefHat,
} from 'lucide-react';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <UtensilsCrossed className="w-8 h-8" />,
      title: 'Comida a la Carta',
      description: 'Deliciosos platos peruanos preparados por chefs expertos',
    },
    {
      icon: <Wine className="w-8 h-8" />,
      title: 'Bebidas Premium',
      description: 'Cervezas, cócteles y vinos seleccionados',
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Reservas Online',
      description: 'Reserva tu mesa de forma rápida y sencilla',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Ambiente Familiar',
      description: 'Un lugar acogedor para disfrutar en familia',
    },
  ];

  const testimonials = [
    {
      name: 'María González',
      comment: 'La comida es deliciosa y el ambiente muy acogedor. Mi familia y yo venimos siempre.',
      rating: 5,
    },
    {
      name: 'Carlos Mendoza',
      comment: 'Excelente atención y los cócteles son los mejores de Chosica.',
      rating: 5,
    },
    {
      name: 'Ana Torres',
      comment: 'El sistema de reservas es muy práctico. Siempre encuentro mesa disponible.',
      rating: 5,
    },
  ];

  return (
    <div className="welcome-page min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-[#8B4513] p-2 rounded-lg">
                <GlassWater className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#8B4513]">La Pituca</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative bg-gradient-to-r from-[#8B4513] to-[#5D2E0C] text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-card/20 px-4 py-2 rounded-full mb-6">
                <Star className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-sm font-medium">Desde 2021</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Bienvenido a <span className="text-[#D4AF37]">La Pituca</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                El restobar más acogedor de Chosica. Disfruta de la mejor comida peruana y bebidas en un ambiente
                familiar único.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="bg-[#D4AF37] text-foreground hover:bg-[#B8962F] font-semibold"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Soy Cliente
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="border-white text-white hover:bg-card hover:text-[#8B4513]"
                >
                  <ChefHat className="w-5 h-5 mr-2" />
                  Soy Trabajador
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
               <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#D4AF37]">3+</div>
                    <div className="text-white/80 text-sm">Años de experiencia</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#D4AF37]">20</div>
                    <div className="text-white/80 text-sm">Mesas disponibles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#D4AF37]">50+</div>
                    <div className="text-white/80 text-sm">Productos en carta</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#D4AF37]">4.8</div>
                    <div className="text-white/80 text-sm">Calificación promedio</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="bg-[#8B4513]/10 p-3 rounded-full">
                <Clock className="w-5 h-5 text-[#8B4513]" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Horario de Atención</div>
                <div className="text-sm text-muted-foreground">5:00 PM - 2:00 AM</div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="bg-[#8B4513]/10 p-3 rounded-full">
                <MapPin className="w-5 h-5 text-[#8B4513]" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Ubicación</div>
                <div className="text-sm text-muted-foreground">Jr. Chiclayo 388, Chosica</div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="bg-[#8B4513]/10 p-3 rounded-full">
                <Phone className="w-5 h-5 text-[#8B4513]" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Contacto</div>
                <div className="text-sm text-muted-foreground">987 654 321</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ¿Por qué elegir <span className="text-[#8B4513]">La Pituca</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ofrecemos la mejor experiencia gastronómica con productos de calidad y un servicio excepcional.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="bg-[#8B4513]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#8B4513]">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#8B4513] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¿Listo para disfrutar de la experiencia La Pituca?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Regístrate ahora y realiza tu primera reserva. Disfruta de promociones exclusivas para clientes
            registrados.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/login')}
            className="bg-[#D4AF37] text-foreground hover:bg-[#B8962F] font-semibold"
          >
            Comenzar Ahora
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Lo que dicen nuestros <span className="text-[#8B4513]">clientes</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="rounded-xl border border-border bg-muted p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={`${testimonial.name}-${i}`} className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-foreground mb-4 italic">"{testimonial.comment}"</p>
                <div className="font-semibold text-[#8B4513]">{testimonial.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#1F2937] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#8B4513] p-2 rounded-lg">
                  <GlassWater className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">La Pituca</span>
              </div>
              <p className="text-gray-400 text-sm">
                Restobar familiar con la mejor comida peruana y bebidas de Chosica.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Horario</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>Lunes - Domingo</li>
                <li>5:00 PM - 2:00 AM</li>
                <li>Turno tarde: 5:00 PM - 10:00 PM</li>
                <li>Turno noche: 10:00 PM - 2:00 AM</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>Jr. Chiclayo 388, Chosica</li>
                <li>Tel: 987 654 321</li>
                <li>Email: info@lapituca.com</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-white transition-colors" type="button">
                    Iniciar Sesión
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-white transition-colors" type="button">
                    Registrarse
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2026 La Pituca Restobar. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;