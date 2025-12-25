class RankingService {
  static calculateDailyRanking(progressData) {
    return progressData.map(patient => {
      // Calcular percentagem de conclusão
      const completionRate = Math.min(
        (patient.completedMissions / 3) * 100, // 3 missões diárias
        100
      );

      // Determinar número de estrelas
      let stars = 0;
      if (completionRate >= 90) stars = 5;
      else if (completionRate >= 75) stars = 4;
      else if (completionRate >= 60) stars = 3;
      else if (completionRate >= 40) stars = 2;
      else if (completionRate > 0) stars = 1;

      return {
        ...patient,
        completionRate,
        stars,
        rank: 0 // Será calculado depois
      };
    }).sort((a, b) => b.completionRate - a.completionRate)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }

  static generateRankingMessage(rank, completionRate) {
    if (rank === 1 && completionRate === 100) {
      return 'Campeão! 100% das missões diárias feitas';
    } else if (completionRate >= 90) {
      return 'Excelente trabalho! Quase perfeito!';
    } else if (completionRate >= 70) {
      return 'Bom progresso! Continua assim!';
    } else {
      return 'Podes fazer melhor amanhã!';
    }
  }
}

module.exports = RankingService;