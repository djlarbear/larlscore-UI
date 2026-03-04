import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface StaleBet {
  id: string;
  date: string;
  days_old: number;
  game: string;
  recommendation: string;
  edge: number;
  confidence: number;
  market_line: number;
  status: string;
}

interface ApiResponse {
  stale_count: number;
  bets: StaleBet[];
}

const StaleBetsManager: React.FC = () => {
  const [staleBets, setStaleBets] = useState<StaleBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBet, setSelectedBet] = useState<StaleBet | null>(null);
  const [formData, setFormData] = useState({
    actual_score: '',
    result: 'WIN',
    notes: ''
  });

  useEffect(() => {
    fetchStaleBets();
  }, []);

  const fetchStaleBets = async () => {
    try {
      const response = await axios.get<ApiResponse>('/api/stale-bets');
      setStaleBets(response.data.bets);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stale bets:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBet) return;

    try {
      const response = await axios.post('/api/manual-score', {
        bet_id: selectedBet.id,
        actual_score: formData.actual_score,
        result: formData.result,
        source: 'manual_dashboard',
        notes: formData.notes
      });

      if (response.status === 200) {
        // Remove from list and reset
        setStaleBets(staleBets.filter(b => b.id !== selectedBet.id));
        setSelectedBet(null);
        setFormData({ actual_score: '', result: 'WIN', notes: '' });
        alert(`Bet graded as ${formData.result}`);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score');
    }
  };

  if (loading) return <div>Loading stale bets...</div>;

  return (
    <div className="stale-bets-container p-4">
      <h2 className="text-2xl font-bold mb-4">
        Manual Verification Required ({staleBets.length})
      </h2>

      {staleBets.length === 0 ? (
        <p className="text-green-600">No stale bets. All bets graded or recent.</p>
      ) : (
        <div className="grid gap-4">
          {/* Bet List */}
          <div className="bet-list bg-gray-50 p-4 rounded">
            <h3 className="font-bold mb-3">Bets Pending Verification:</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {staleBets.map((bet) => (
                <div
                  key={bet.id}
                  onClick={() => setSelectedBet(bet)}
                  className={`p-3 rounded cursor-pointer transition ${
                    selectedBet?.id === bet.id
                      ? 'bg-blue-200 border-2 border-blue-500'
                      : 'bg-white border border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-semibold">{bet.game}</span>
                    <span className="text-red-600 font-bold">{bet.days_old}d old</span>
                  </div>
                  <p className="text-sm text-gray-600">{bet.recommendation}</p>
                  <p className="text-xs text-gray-400">
                    {bet.date} | Edge: {bet.edge.toFixed(1)}pt | Conf: {bet.confidence.toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Entry Form */}
          {selectedBet && (
            <form onSubmit={handleSubmit} className="entry-form bg-blue-50 p-4 rounded border-2 border-blue-400">
              <h3 className="font-bold mb-3">Enter Actual Stats</h3>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Actual Score/Stats
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 26.5"
                  value={formData.actual_score}
                  onChange={(e) => setFormData({ ...formData, actual_score: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  Market line: {selectedBet.market_line} | Hit if: {Number(formData.actual_score) > selectedBet.market_line ? 'WIN' : 'LOSS'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Result</label>
                <select
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option>WIN</option>
                  <option>LOSS</option>
                  <option>PUSH</option>
                  <option>VOID</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Notes (optional)</label>
                <textarea
                  placeholder="e.g., Looked up on ESPN box score"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 border rounded text-sm"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
                >
                  Submit Score
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBet(null)}
                  className="flex-1 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Instructions */}
          <div className="instructions bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
            <h4 className="font-bold mb-2">How to use:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Click a bet to select it</li>
              <li>Look up the player's actual stats (ESPN box score)</li>
              <li>Enter the actual score in the form</li>
              <li>Select WIN/LOSS/PUSH/VOID</li>
              <li>Click "Submit Score" to grade</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaleBetsManager;
