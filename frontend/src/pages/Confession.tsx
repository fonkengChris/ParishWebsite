import { useState } from 'react';
import Layout from '../components/Layout';
import { confessionSteps, confessionPrayers } from '../data/confessionData';

export default function Confession() {
  const [expandedPrayers, setExpandedPrayers] = useState<Set<string>>(new Set());

  const togglePrayer = (title: string) => {
    const newExpanded = new Set(expandedPrayers);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedPrayers(newExpanded);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">Sacrament of Confession</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Learn about the Sacrament of Reconciliation and how to make a good confession.
          </p>
        </div>

        <div className="space-y-6">
          {/* What is Confession Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What is Confession?</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              The Sacrament of Reconciliation, also known as Confession or Penance, is one of the seven sacraments 
              of the Catholic Church. Through this sacrament, we receive God's forgiveness for the sins we have 
              committed after Baptism.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Jesus Christ instituted this sacrament when He said to the Apostles: "Receive the Holy Spirit. 
              If you forgive the sins of any, they are forgiven; if you retain the sins of any, they are retained" 
              (John 20:22-23).
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              This sacrament brings about reconciliation with God and with the Church, restores the grace lost 
              through sin, and gives us the strength to resist temptation in the future.
            </p>
          </div>

          {/* Steps for Confession Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Make a Good Confession</h2>
            <div className="space-y-6">
              {confessionSteps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prayers Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Prayers for Confession</h2>
            <div className="space-y-4">
              {Object.values(confessionPrayers).map((prayer) => (
                <div key={prayer.title} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => togglePrayer(prayer.title)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg font-semibold text-gray-900">{prayer.title}</span>
                    <svg
                      className={`w-5 h-5 ml-3 text-primary-600 transition-transform ${expandedPrayers.has(prayer.title) ? 'rotate-180' : ''}`}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedPrayers.has(prayer.title) && (
                    <div className="px-6 pb-4 space-y-4 bg-gray-50 border-t border-gray-200">
                      <div>
                        <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                        <p className="text-base leading-relaxed whitespace-pre-line text-gray-700">{prayer.english}</p>
                      </div>
                      {prayer.latin && (
                        <div>
                          <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                          <p className="text-base leading-relaxed italic whitespace-pre-line text-gray-700">{prayer.latin}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Examination of Conscience Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Examination of Conscience</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Before going to confession, it is important to examine your conscience. Here are some questions 
              to help you reflect on the Ten Commandments:
            </p>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">The First Commandment: "I am the Lord your God; you shall not have strange gods before me."</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Have I put God first in my life?</li>
                  <li>Have I made idols of money, success, or other things?</li>
                  <li>Have I practiced superstition or consulted fortune tellers?</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">The Second Commandment: "You shall not take the name of the Lord your God in vain."</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Have I used God's name in vain or cursed?</li>
                  <li>Have I broken promises or vows made to God?</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">The Third Commandment: "Remember to keep holy the Lord's Day."</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Have I missed Mass on Sundays or Holy Days of Obligation without a serious reason?</li>
                  <li>Have I done unnecessary work on Sunday?</li>
                  <li>Have I set aside time for prayer and rest?</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">The Fourth Commandment: "Honor your father and your mother."</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Have I honored and respected my parents and those in authority?</li>
                  <li>Have I been disobedient or disrespectful?</li>
                  <li>Have I neglected my duties to my family?</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">The Fifth Commandment: "You shall not kill."</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Have I harmed others physically or emotionally?</li>
                  <li>Have I been angry, hateful, or held grudges?</li>
                  <li>Have I abused drugs or alcohol?</li>
                  <li>Have I had an abortion or encouraged someone to have one?</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">The Sixth Commandment: "You shall not commit adultery."</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Have I been faithful to my spouse in thought, word, and deed?</li>
                  <li>Have I engaged in sexual activity outside of marriage?</li>
                  <li>Have I viewed pornography or engaged in impure thoughts?</li>
                  <li>Have I respected the dignity of others and their bodies?</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">The Seventh Commandment: "You shall not steal."</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Have I stolen or damaged the property of others?</li>
                  <li>Have I cheated or been dishonest in business?</li>
                  <li>Have I paid my debts and fulfilled my obligations?</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">The Eighth Commandment: "You shall not bear false witness against your neighbor."</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Have I lied or deceived others?</li>
                  <li>Have I gossiped or spread rumors?</li>
                  <li>Have I damaged the reputation of others?</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">The Ninth Commandment: "You shall not covet your neighbor's wife."</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Have I had impure thoughts or desires?</li>
                  <li>Have I been envious of others' relationships?</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">The Tenth Commandment: "You shall not covet your neighbor's goods."</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Have I been envious or jealous of what others have?</li>
                  <li>Have I been greedy or materialistic?</li>
                  <li>Have I been content with what God has given me?</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl shadow-lg p-8 border border-primary-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Important Reminders</h2>
            <ul className="space-y-3 text-gray-700 text-lg">
              <li className="flex items-start">
                <span className="text-primary-600 mr-3 font-bold">•</span>
                <span>Confession is available regularly at scheduled times. Check the Mass Schedule or contact the parish office for times.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-3 font-bold">•</span>
                <span>You must confess all mortal sins in kind and number. If you are unsure whether a sin is mortal or venial, it is better to confess it.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-3 font-bold">•</span>
                <span>The seal of confession is absolute. The priest is bound by the strictest secrecy and cannot reveal anything you confess, even under threat of death.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-3 font-bold">•</span>
                <span>If you have been away from the sacrament for a long time, do not be afraid. The priest is there to help you, not to judge you.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-3 font-bold">•</span>
                <span>It is recommended to go to confession at least once a year, but many Catholics go monthly or even weekly for spiritual growth.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}

