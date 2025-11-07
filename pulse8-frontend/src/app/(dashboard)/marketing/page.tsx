'use client' 

import { useState, useEffect } from 'react'

import Link from 'next/link'

import {

  Plus,

  Megaphone,

  Calendar,

  TrendingUp,

  Users,

  Target,

  Clock,

  CheckCircle,

  AlertCircle,

  BarChart3,

  Image,

  FileText,

  Video,

  Share,

  ArrowRight

} from 'lucide-react'

import { Button } from '@/components/ui/button'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { MarketingService, MarketingDto } from '@/lib/api/marketing'

import { MarketingPostsService } from '@/lib/api/marketing-posts'

import { AssetsService } from '@/lib/api/assets'



interface MarketingStats {

  total: number

  active: number

  inactive: number

  completed: number

  byType: {

    Campaign: number

    Event: number

    'Social Media': number

  }

  totalBudget: number

  postsCount: number

  assetsCount: number

}



export default function MarketingPage() {

  const [marketingData, setMarketingData] = useState<MarketingDto[]>([])

  const [stats, setStats] = useState<MarketingStats>({

    total: 0,

    active: 0,

    inactive: 0,

    completed: 0,

    byType: {

      Campaign: 0,

      Event: 0,

      'Social Media': 0

    },

    totalBudget: 0,

    postsCount: 0,

    assetsCount: 0

  })

  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] = useState('')



  // Carregar dados gerais de marketing da API

  useEffect(() => {

    const loadMarketingData = async () => {

      try {

        setIsLoading(true)

        console.log('🔍 Carregando dados de marketing da API...')

        

        // Buscar campanhas, posts e assets em paralelo

        const [campaignsResponse, postsResponse, assetsResponse] = await Promise.all([

          MarketingService.getMarketingCampaigns({

            pageNumber: 1,

            pageSize: 1000 // Buscar todos para calcular estatísticas

          }).catch(err => {

            console.warn('⚠️ Erro ao carregar campanhas:', err)

            return { campaigns: [], totalCount: 0 }

          }),

          MarketingPostsService.getMarketingPosts(1, 1000).catch(err => {

            console.warn('⚠️ Erro ao carregar posts:', err)

            return { posts: [], totalCount: 0 }

          }),

          AssetsService.getAssets({

            pageNumber: 1,

            pageSize: 1000

          }).catch(err => {

            console.warn('⚠️ Erro ao carregar assets:', err)

            return { assets: [], totalCount: 0 }

          })

        ])

        

        console.log('✅ Dados carregados:', {

          campaigns: campaignsResponse,

          posts: postsResponse,

          assets: assetsResponse

        })

        

        const campaignsData = campaignsResponse.campaigns || []

        const postsData = postsResponse.posts || []

        const assetsData = assetsResponse.assets || []

        

        // Log dos dados para debug

        console.log('📊 Dados brutos recebidos:', {

          totalCampaigns: campaignsData.length,

          sampleCampaign: campaignsData[0],

          allTypes: Array.from(new Set(campaignsData.map((c: MarketingDto) => c.type).filter((type): type is string => Boolean(type)))),

          allStatuses: Array.from(new Set(campaignsData.map((c: MarketingDto) => c.status).filter((status): status is string => Boolean(status))))

        })

        

        setMarketingData(campaignsData)



        // Calcular estatísticas

        const calculatedStats: MarketingStats = {

          total: campaignsData.length,

          active: campaignsData.filter((item: MarketingDto) => 

            item.status === 'Active' || item.status === 'active'

          ).length,

          inactive: campaignsData.filter((item: MarketingDto) => 

            item.status === 'Inactive' || item.status === 'inactive'

          ).length,

          completed: campaignsData.filter((item: MarketingDto) => 

            item.status === 'Completed' || item.status === 'completed'

          ).length,

          byType: {

            // Normalizar tipos para comparação (case-insensitive e sem espaços)

            Campaign: (() => {

              const normalizeType = (type: string) => (type || '').toLowerCase().replace(/\s+/g, '')

              return campaignsData.filter((item: MarketingDto) => {

                const normalizedType = normalizeType(item.type)

                return normalizedType !== 'event' && normalizedType !== ''

              }).length

            })(),

            Event: (() => {

              const normalizeType = (type: string) => (type || '').toLowerCase().replace(/\s+/g, '')

              return campaignsData.filter((item: MarketingDto) => {

                const normalizedType = normalizeType(item.type)

                return normalizedType === 'event'

              }).length

            })(),

            'Social Media': (() => {

              const normalizeType = (type: string) => (type || '').toLowerCase().replace(/\s+/g, '')

              return campaignsData.filter((item: MarketingDto) => {

                const normalizedType = normalizeType(item.type)

                return normalizedType === 'socialmedia' || normalizedType === 'social media'

              }).length

            })()

          },

          totalBudget: campaignsData.reduce((sum: number, item: MarketingDto) => sum + (item.budget || 0), 0),

          postsCount: postsResponse.totalCount || postsData.length,

          assetsCount: assetsResponse.totalCount || assetsData.length

        }



        console.log('✅ Estatísticas calculadas:', calculatedStats)

        setStats(calculatedStats)

        setError('')

      } catch (err: any) {

        console.error('❌ Erro ao carregar dados de marketing:', err)

        setError(err.message || 'Erro ao carregar dados de marketing')

      } finally {

        setIsLoading(false)

      }

    }



    loadMarketingData()

  }, [])



  if (isLoading) {

    return (

      <div className="flex items-center justify-center h-64">

        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>

      </div>

    )

  }



  if (error) {

    return (

      <div className="text-center py-12">

        <div className="text-red-600 mb-4">❌ {error}</div>

        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>

      </div>

    )

  }



  return (

    <div className="space-y-6 overflow-x-hidden">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Marketing - Visão Geral</h1>

          <p className="text-sm sm:text-base text-gray-600">Acompanhe os dados gerais dos seus cadastros de marketing</p>

        </div>

        <Link href="/marketing/create" className="flex-shrink-0">

          <Button size="sm" className="flex items-center gap-2">

            <Plus className="h-4 w-4" />

            <span className="hidden sm:inline">Novo Cadastro</span>

          </Button>

        </Link>

      </div>



      {/* Stats Cards - Status */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

        <Card>

          <CardContent className="p-4 sm:p-6">

            <div className="flex items-center">

              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">

                <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />

              </div>

              <div className="ml-3 sm:ml-4 min-w-0">

                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total</p>

                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{stats.total}</p>

              </div>

            </div>

          </CardContent>

        </Card>



        <Card>

          <CardContent className="p-4 sm:p-6">

            <div className="flex items-center">

              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">

                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />

              </div>

              <div className="ml-3 sm:ml-4 min-w-0">

                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Ativos</p>

                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{stats.active}</p>

              </div>

            </div>

          </CardContent>

        </Card>



        <Card>

          <CardContent className="p-4 sm:p-6">

            <div className="flex items-center">

              <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">

                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />

              </div>

              <div className="ml-3 sm:ml-4 min-w-0">

                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Inativos</p>

                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{stats.inactive}</p>

              </div>

            </div>

          </CardContent>

        </Card>



        <Card>

          <CardContent className="p-4 sm:p-6">

            <div className="flex items-center">

              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">

                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />

              </div>

              <div className="ml-3 sm:ml-4 min-w-0">

                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Concluídos</p>

                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{stats.completed}</p>

              </div>

            </div>

          </CardContent>

        </Card>

      </div>



      {/* Stats Cards - Type and Budget */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

        <Card>

          <CardContent className="p-4 sm:p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs sm:text-sm font-medium text-gray-600">Campanhas</p>

                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.byType.Campaign}</p>

              </div>

              <div className="p-2 bg-purple-100 rounded-lg">

                <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />

              </div>

            </div>

          </CardContent>

        </Card>



        <Card>

          <CardContent className="p-4 sm:p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs sm:text-sm font-medium text-gray-600">Eventos</p>

                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.byType.Event}</p>

              </div>

              <div className="p-2 bg-orange-100 rounded-lg">

                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />

              </div>

            </div>

          </CardContent>

        </Card>



        <Card>

          <CardContent className="p-4 sm:p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs sm:text-sm font-medium text-gray-600">Redes Sociais</p>

                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.byType['Social Media']}</p>

              </div>

              <div className="p-2 bg-pink-100 rounded-lg">

                <Share className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />

              </div>

            </div>

          </CardContent>

        </Card>



        <Card>

          <CardContent className="p-4 sm:p-6">

            <div className="flex items-center justify-between">

              <div className="min-w-0">

                <p className="text-xs sm:text-sm font-medium text-gray-600">Orçamento Total</p>

                <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1 truncate">

                  {stats.totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}

                </p>

              </div>

              <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">

                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />

              </div>

            </div>

          </CardContent>

        </Card>

      </div>



      {/* Quick Actions / Links */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">

          <Link href="/marketing/campaigns">

            <CardHeader>

              <div className="flex items-center justify-between">

                <CardTitle className="text-lg">Campanhas</CardTitle>

                <Megaphone className="h-5 w-5 text-indigo-600" />

              </div>

              <CardDescription>Gerenciar e visualizar todas as campanhas</CardDescription>

            </CardHeader>

            <CardContent>

              <div className="flex items-center justify-between">

                <span className="text-2xl font-bold text-indigo-600">{stats.byType.Campaign}</span>

                <ArrowRight className="h-4 w-4 text-gray-400" />

              </div>

            </CardContent>

          </Link>

        </Card>



        <Card className="hover:shadow-lg transition-shadow cursor-pointer">

          <Link href="/marketing/posts">

            <CardHeader>

              <div className="flex items-center justify-between">

                <CardTitle className="text-lg">Posts</CardTitle>

                <FileText className="h-5 w-5 text-blue-600" />

              </div>

              <CardDescription>Gerenciar posts e conteúdo</CardDescription>

            </CardHeader>

            <CardContent>

              <div className="flex items-center justify-between">

                <span className="text-2xl font-bold text-blue-600">{stats.postsCount}</span>

                <ArrowRight className="h-4 w-4 text-gray-400" />

              </div>

            </CardContent>

          </Link>

        </Card>



        <Card className="hover:shadow-lg transition-shadow cursor-pointer">

          <Link href="/marketing/assets">

            <CardHeader>

              <div className="flex items-center justify-between">

                <CardTitle className="text-lg">Assets</CardTitle>

                <Image className="h-5 w-5 text-green-600" />

              </div>

              <CardDescription>Gerenciar imagens, vídeos e documentos</CardDescription>

            </CardHeader>

            <CardContent>

              <div className="flex items-center justify-between">

                <span className="text-2xl font-bold text-green-600">{stats.assetsCount}</span>

                <ArrowRight className="h-4 w-4 text-gray-400" />

              </div>

            </CardContent>

          </Link>

        </Card>



        <Card className="hover:shadow-lg transition-shadow cursor-pointer">

          <Link href="/marketing/schedules">

            <CardHeader>

              <div className="flex items-center justify-between">

                <CardTitle className="text-lg">Agendamentos</CardTitle>

                <Calendar className="h-5 w-5 text-purple-600" />

              </div>

              <CardDescription>Visualizar e gerenciar agendamentos</CardDescription>

            </CardHeader>

            <CardContent>

              <div className="flex items-center justify-between">

                <span className="text-2xl font-bold text-purple-600">-</span>

                <ArrowRight className="h-4 w-4 text-gray-400" />

              </div>

            </CardContent>

          </Link>

        </Card>



        <Card className="hover:shadow-lg transition-shadow cursor-pointer">

          <Link href="/marketing/create">

            <CardHeader>

              <div className="flex items-center justify-between">

                <CardTitle className="text-lg">Novo Cadastro</CardTitle>

                <Plus className="h-5 w-5 text-indigo-600" />

              </div>

              <CardDescription>Criar novo cadastro de marketing</CardDescription>

            </CardHeader>

            <CardContent>

              <div className="flex items-center justify-between">

                <Button className="bg-indigo-600 hover:bg-indigo-700">

                  Criar

                </Button>

                <ArrowRight className="h-4 w-4 text-gray-400" />

              </div>

            </CardContent>

          </Link>

        </Card>

      </div>



      {/* Empty State */}

      {stats.total === 0 && (

        <Card>

          <CardContent className="text-center py-12">

            <Megaphone className="mx-auto h-12 w-12 text-gray-400" />

            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cadastro de marketing encontrado</h3>

            <p className="mt-1 text-sm text-gray-500">

              Comece criando um novo cadastro de marketing.

            </p>

            <div className="mt-6">

              <Link href="/marketing/create">

                <Button>

                  <Plus className="h-4 w-4 mr-2" />

                  Novo Cadastro

                </Button>

              </Link>

            </div>

          </CardContent>

        </Card>

      )}

    </div>

  )

}
