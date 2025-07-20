import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckIcon, UsersIcon, FileTextIcon, CreditCardIcon, ShieldCheckIcon, ClockIcon, StarIcon } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Zahn</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <a href="#recursos">Recursos</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="#precos">Preços</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin">Login</a>
              </Button>
              <Button asChild>
                <a href="#comecar">Começar</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              Plataforma completa para clínicas odontológicas
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 max-w-4xl mx-auto">
            Gestão Completa para Sua <span className="text-blue-600">Clínica Odontológica</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Gerenciamento profissional de pacientes, planejamento de tratamentos e ferramentas de crescimento para clínicas odontológicas modernas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Começar Agora
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3">
              Ver Demonstração
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            ✓ Setup em minutos • ✓ Suporte em português • ✓ Dados seguros
          </p>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Pare de perder tempo com processos manuais
          </h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileTextIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Prontuários Manuais</h3>
              <p className="text-sm text-gray-600">Fichas em papel e planilhas desorganizadas</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tempo Perdido</h3>
              <p className="text-sm text-gray-600">Busca demorada por informações dos pacientes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCardIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Controle Financeiro</h3>
              <p className="text-sm text-gray-600">Dificuldades no controle de pagamentos</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Coordenação</h3>
              <p className="text-sm text-gray-600">Falta de integração entre dentistas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que sua clínica precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sistema completo desenvolvido especialmente para o mercado brasileiro
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Feature 1: Patient Management */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Gestão Completa de Pacientes</CardTitle>
                <CardDescription>
                  Cadastro, busca e acompanhamento de pacientes com validação de CPF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Cadastro instantâneo com validação de CPF</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Busca avançada por nome, CPF ou telefone</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Histórico médico e odontológico completo</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Gerenciamento de convênios e planos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2: Treatment Planning */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FileTextIcon className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Planejamento de Tratamentos</CardTitle>
                <CardDescription>
                  Documentação profissional e planejamento detalhado por dente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Anamnese detalhada com 35+ perguntas</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Planejamento específico por dente</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Precificação automática de procedimentos</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Upload seguro de arquivos e imagens</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3: Multi-Clinic */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Multi-Clínica e Segurança</CardTitle>
                <CardDescription>
                  Arquitetura segura para clínicas de todos os tamanhos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Identidade visual personalizada</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Colaboração entre múltiplos dentistas</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Isolamento seguro de dados (LGPD)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Formulários profissionais para pacientes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Financial Control */}
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Controle Financeiro Completo
            </h3>
            <p className="text-gray-600 mb-6">
              Visibilidade total dos pagamentos e orçamentos da sua clínica
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-sm font-medium">Orçamentos</div>
                <div className="text-xs text-gray-500">Planejamento financeiro</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-medium">Controle</div>
                <div className="text-xs text-gray-500">Acompanhamento</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-sm font-medium">Relatórios</div>
                <div className="text-xs text-gray-500">Visão financeira</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">🏥</div>
                <div className="text-sm font-medium">Convênios</div>
                <div className="text-xs text-gray-500">Gestão de planos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Por que escolher o Zahn?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Desenvolvido por especialistas para profissionais da odontologia brasileira
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Economize Tempo</h3>
              <p className="text-blue-100">
                Reduza em até 70% o tempo gasto com tarefas administrativas
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Segurança Total</h3>
              <p className="text-blue-100">
                Conformidade com LGPD e padrões de segurança médica
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Experiência Profissional</h3>
              <p className="text-blue-100">
                Interface moderna que impressiona seus pacientes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Um plano simples e completo
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todos os recursos que sua clínica precisa por um preço justo
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="border-2 border-blue-600 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">Plano Único</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Zahn Profissional</CardTitle>
                <CardDescription>Tudo que sua clínica precisa</CardDescription>
                <div className="text-4xl font-bold text-gray-900 mt-4">R$ 97</div>
                <div className="text-sm text-gray-500">por dentista/mês</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Pacientes ilimitados</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Dentistas ilimitados</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Todos os recursos inclusos</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Identidade personalizada</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Suporte prioritário</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Setup rápido e fácil</span>
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                  Começar Agora
                </Button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Comece a usar imediatamente
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              ✓ Sem taxas de setup • ✓ Cancele quando quiser • ✓ Dados sempre seus
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="comecar" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comece em 3 passos simples
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Configure sua clínica e comece a atender em minutos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Crie sua conta</h3>
              <p className="text-gray-600">
                Configure sua clínica com identidade visual personalizada
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Adicione sua equipe</h3>
              <p className="text-gray-600">
                Convide dentistas e configure permissões de acesso
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Comece a atender</h3>
              <p className="text-gray-600">
                Cadastre pacientes e gerencie tratamentos
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg">
              Começar Agora
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Configure sua clínica e comece a atender hoje mesmo
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Z</span>
                </div>
                <span className="text-xl font-bold">Zahn</span>
              </div>
              <p className="text-gray-400 mb-4">
                Gestão moderna para clínicas odontológicas brasileiras
              </p>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Zahn. Todos os direitos reservados.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#recursos" className="hover:text-white">Recursos</a></li>
                <li><a href="#precos" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">Demonstração</a></li>
                <li><a href="#" className="hover:text-white">Segurança</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">WhatsApp</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white">LGPD</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          <Separator className="bg-gray-800 mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              Desenvolvido com ❤️ para dentistas brasileiros
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Badge variant="outline" className="text-gray-400 border-gray-700">
                🔒 LGPD Compliant
              </Badge>
              <Badge variant="outline" className="text-gray-400 border-gray-700">
                🛡️ Dados Seguros
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
